import { Router, Request } from 'express';
import crypto from 'crypto';
import { esClient } from '../elastic';

const router = Router();

const ADMIN_USERNAME = 'admin';
let ADMIN_PASSWORD = 'admin';
const MAX_FAILED_ATTEMPTS = 3;
const BLOCK_DURATION_HOURS = 1;

interface FailedAttempt {
  ip: string;
  timestamp: string;
  username: string;
}

// Initialize the failed_login_attempts index
async function ensureIndex() {
  try {
    const exists = await esClient.indices.exists({ index: 'failed_login_attempts' });
    if (!exists) {
      await esClient.indices.create({
        index: 'failed_login_attempts',
        body: {
          mappings: {
            properties: {
              ip: { type: 'keyword' },
              timestamp: { type: 'date' },
              username: { type: 'keyword' },
              blocked: { type: 'boolean' }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Error ensuring index:', err);
  }
}

ensureIndex();

// Admin settings storage (username/password hash)
async function getAdminSettings(): Promise<{ username: string; passwordHash: string } | null> {
  try {
    const r: any = await esClient.get({ index: 'admin_settings', id: 'admin' }).catch(() => null);
    if (r && r._source) return { username: r._source.username, passwordHash: r._source.passwordHash };
    return null;
  } catch {
    return null;
  }
}

async function ensureAdminSettingsIndex() {
  try {
    const exists = await esClient.indices.exists({ index: 'admin_settings' });
    if (!exists) {
      await esClient.indices.create({
        index: 'admin_settings',
        body: {
          mappings: {
            properties: {
              username: { type: 'keyword' },
              passwordHash: { type: 'keyword' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Error ensuring admin_settings index:', err);
  }
}

ensureAdminSettingsIndex();

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// Get client IP address from request
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// Check if IP is permanently blocked
async function isIpBlocked(ip: string): Promise<boolean> {
  try {
    const result = await esClient.search({
      index: 'failed_login_attempts',
      body: {
        query: {
          bool: {
            must: [
              { term: { ip } },
              { term: { blocked: true } }
            ]
          }
        }
      }
    });
    const total = result.hits.total as { value: number };
    return total?.value > 0;
  } catch (err) {
    console.error('Error checking if IP is blocked:', err);
    return false;
  }
}

// Get failed attempts in the last hour
async function getRecentFailedAttempts(ip: string): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - BLOCK_DURATION_HOURS * 60 * 60 * 1000).toISOString();
    
    const result = await esClient.search({
      index: 'failed_login_attempts',
      body: {
        query: {
          bool: {
            must: [
              { term: { ip } },
              { range: { timestamp: { gte: oneHourAgo } } }
            ]
          }
        }
      }
    });
    
    const total = result.hits.total as { value: number };
    return total?.value || 0;
  } catch (err) {
    console.error('Error getting recent failed attempts:', err);
    return 0;
  }
}

// Record a failed login attempt
async function recordFailedAttempt(ip: string, username: string, shouldBlock: boolean) {
  try {
    await esClient.index({
      index: 'failed_login_attempts',
      body: {
        ip,
        username,
        timestamp: new Date().toISOString(),
        blocked: shouldBlock
      },
      refresh: true
    });
  } catch (err) {
    console.error('Error recording failed attempt:', err);
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const clientIp = getClientIp(req);

  // Check if IP is already permanently blocked
  const blocked = await isIpBlocked(clientIp);
  if (blocked) {
    return res.status(403).json({
      ok: false,
      message: 'Access blocked due to multiple failed login attempts.'
    });
  }

  // Check credentials (prefer stored settings if present)
  const settings = await getAdminSettings();
  const valid = settings
    ? (username === settings.username && hashPassword(password) === settings.passwordHash)
    : (username === ADMIN_USERNAME && password === ADMIN_PASSWORD);
  if (valid) {
    // Set a simple session cookie valid for 1 hour
    res.cookie('admin_session', 'active', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });
    return res.json({ ok: true });
  }

  // Failed login - check how many recent attempts
  const recentAttempts = await getRecentFailedAttempts(clientIp);
  const shouldBlock = recentAttempts >= MAX_FAILED_ATTEMPTS - 1; // -1 because we're about to add this attempt

  // Record the failed attempt
  await recordFailedAttempt(clientIp, username, shouldBlock);

  if (shouldBlock) {
    return res.status(403).json({
      ok: false,
      message: 'Too many failed attempts. Your IP has been blocked.'
    });
  }

  const remainingAttempts = MAX_FAILED_ATTEMPTS - recentAttempts - 1;
  return res.status(401).json({
    ok: false,
    message: `Invalid credentials. ${remainingAttempts} attempt(s) remaining.`
  });
});

// Check current session
router.get('/me', (req, res) => {
  const raw = req.headers.cookie || '';
  const hasSession = raw.split(';').some(part => part.trim().startsWith('admin_session='));
  if (hasSession) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false });
});

// Logout: clear session cookie
router.post('/logout', (req, res) => {
  res.clearCookie('admin_session');
  return res.json({ ok: true });
});

// Change password (requires valid session)
router.post('/change-password', async (req, res) => {
  const raw = req.headers.cookie || '';
  const hasSession = raw.split(';').some(part => part.trim().startsWith('admin_session='));
  if (!hasSession) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) return res.status(400).json({ ok: false, error: 'Missing fields' });
  if (newPassword.length < 6) return res.status(400).json({ ok: false, error: 'Password too short' });

  try {
    const settings = await getAdminSettings();
    const currentValid = settings
      ? (hashPassword(currentPassword) === settings.passwordHash)
      : (currentPassword === ADMIN_PASSWORD);
    if (!currentValid) return res.status(401).json({ ok: false, error: 'Current password incorrect' });

    await ensureAdminSettingsIndex();
    await esClient.index({
      index: 'admin_settings',
      id: 'admin',
      refresh: true,
      document: {
        username: ADMIN_USERNAME,
        passwordHash: hashPassword(newPassword),
        updatedAt: new Date().toISOString()
      }
    } as any);

    // Update in-memory fallback for this process until next restart
    ADMIN_PASSWORD = newPassword;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('Failed to change password', err);
    return res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
});

export default router;
