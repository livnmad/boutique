import express from 'express';
import { esClient } from '../elastic';
import { sanitizeSvg } from '../sanitizeSvg';

const router = express.Router();
const INDEX = 'items';

router.get('/', async (req, res) => {
  const q = (req.query.q as string) || '';
  try {
    const body = q
      ? { query: { multi_match: { query: q, fields: ['title^2', 'description'] } } }
      : { query: { match_all: {} } };

  const r = await esClient.search({ index: INDEX, body, size: 50 });
  // cast hit to any to avoid TS spreading issues when _source may be unknown
  const hits = r.hits.hits.map((h: any) => ({ id: h._id, ...(h._source || {}) }));
    res.json({ ok: true, results: hits });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

router.post('/', async (req, res) => {
  const doc = req.body;
  try {
    // sanitize image SVG if present
    if (doc && typeof doc.imageSvg === 'string' && doc.imageSvg.trim()) {
      doc.imageSvg = sanitizeSvg(doc.imageSvg);
    }
  } catch (err) {
    console.warn('SVG sanitization failed', err);
  }
  try {
    const r = await esClient.index({ index: INDEX, document: doc });
    // refresh so reads are immediate for development
    await esClient.indices.refresh({ index: INDEX });
    res.json({ ok: true, id: r._id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;
