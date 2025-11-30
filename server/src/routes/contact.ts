import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Sanitize input to remove malicious content
function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous HTML tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
  sanitized = sanitized.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  return sanitized.trim();
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

router.post('/', async (req, res) => {
  try {
    const { firstName, email, comments, website } = req.body;

    // Honeypot check - if website field is filled, it's likely a bot
    if (website && website.trim() !== '') {
      // Return success to fool the bot, but don't actually send email
      console.log('Honeypot triggered - potential bot submission blocked');
      return res.json({ ok: true, message: 'Message sent successfully' });
    }

    // Validate required fields
    if (!firstName || !email || !comments) {
      return res.status(400).json({ 
        ok: false, 
        error: 'First name, email, and comments are required' 
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid email address' 
      });
    }

    // Sanitize inputs
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedComments = sanitizeInput(comments);

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #d95b6b;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            margin-top: 20px;
            border-radius: 5px;
          }
          .field {
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #d95b6b;
          }
          .value {
            margin-top: 5px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">First Name:</div>
              <div class="value">${sanitizedFirstName}</div>
            </div>
            <div class="field">
              <div class="label">Email Address:</div>
              <div class="value">${sanitizedEmail}</div>
            </div>
            <div class="field">
              <div class="label">Comments:</div>
              <div class="value">${sanitizedComments.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contact@oliviasbeadboutique.com',
      subject: `Contact Form Submission from ${sanitizedFirstName}`,
      html: emailHtml,
      replyTo: sanitizedEmail
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ ok: true, message: 'Message sent successfully' });
  } catch (err: any) {
    console.error('Error sending email:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to send message. Please try again later.' 
    });
  }
});

export default router;
