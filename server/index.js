/**
 * PostComposer Express Backend — Main Server
 *
 * Handles:
 *  - OAuth 2.0 flows for Twitter, LinkedIn, Facebook
 *  - Proxy API calls to social platforms (avoids browser CORS)
 *  - Token management via server-side sessions
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');

const twitterRouter = require('./routes/twitter');
const linkedinRouter = require('./routes/linkedin');
const facebookRouter = require('./routes/facebook');
const publishRouter = require('./routes/publish');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
  })
);

// Session middleware — stores OAuth state and tokens server-side
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    },
  })
);

// ─── Health Check ──────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedPlatforms: {
      twitter: !!req.session.twitterToken,
      linkedin: !!req.session.linkedinToken,
      facebook: !!req.session.facebookToken,
    },
  });
});

// ─── Get Connection Status ────────────────────────────────────────────────

app.get('/connections', (req, res) => {
  res.json({
    twitter: {
      connected: !!req.session.twitterToken,
      username: req.session.twitterUsername || null,
    },
    linkedin: {
      connected: !!req.session.linkedinToken,
      name: req.session.linkedinName || null,
    },
    facebook: {
      connected: !!req.session.facebookToken,
      pages: req.session.facebookPages || [],
    },
  });
});

// ─── Disconnect a Platform ────────────────────────────────────────────────

app.post('/disconnect/:platform', (req, res) => {
  const { platform } = req.params;
  switch (platform) {
    case 'twitter':
      delete req.session.twitterToken;
      delete req.session.twitterUsername;
      delete req.session.twitterUserId;
      break;
    case 'linkedin':
      delete req.session.linkedinToken;
      delete req.session.linkedinName;
      delete req.session.linkedinPersonUrn;
      break;
    case 'facebook':
      delete req.session.facebookToken;
      delete req.session.facebookPages;
      break;
    default:
      return res.status(400).json({ error: `Unknown platform: ${platform}` });
  }
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: 'Failed to save session' });
    res.json({ success: true, message: `Disconnected from ${platform}` });
  });
});

// ─── Platform Routes ──────────────────────────────────────────────────────

app.use('/auth/twitter', twitterRouter);
app.use('/auth/linkedin', linkedinRouter);
app.use('/auth/facebook', facebookRouter);
app.use('/publish', publishRouter);

// ─── Global Error Handler ────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 PostComposer API Server running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${FRONTEND_URL}`);
  console.log(`\n Platform OAuth Status:`);
  console.log(`  Twitter  → ${process.env.TWITTER_CLIENT_ID ? '✅ Configured' : '❌ Not configured (add TWITTER_CLIENT_ID to .env)'}`);
  console.log(`  LinkedIn → ${process.env.LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Not configured (add LINKEDIN_CLIENT_ID to .env)'}`);
  console.log(`  Facebook → ${process.env.FACEBOOK_APP_ID ? '✅ Configured' : '❌ Not configured (add FACEBOOK_APP_ID to .env)'}`);
  console.log(`\n`);
});

module.exports = app;
