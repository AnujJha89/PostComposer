const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

const CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;

router.get('/login', (req, res) => {
  if (!CLIENT_ID) {
    // DEMO MODE: if keys are missing, simulate success
    return res.json({ url: 'http://localhost:3001/auth/twitter/callback?code=demo_code&state=demo_state' });
  }
  
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  req.session.twitterState = state;
  req.session.twitterCodeVerifier = codeVerifier;

  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}&code_challenge=${codeVerifier}&code_challenge_method=plain`;
  
  res.json({ url: authUrl });
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // DEMO MODE CHECK
  if (code === 'demo_code') {
    req.session.twitterToken = 'demo_twitter_token';
    req.session.twitterUsername = 'DemoUser_X';
    return res.send(`<script>window.opener.postMessage('oauth_success', '*'); window.close();</script>`);
  }

  if (state !== req.session.twitterState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: CALLBACK_URL,
      code_verifier: req.session.twitterCodeVerifier,
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });

    req.session.twitterToken = response.data.access_token;
    req.session.twitterRefreshToken = response.data.refresh_token;

    // Fetch user info
    const userRes = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${req.session.twitterToken}` }
    });
    
    req.session.twitterUsername = userRes.data.data.username;
    req.session.twitterUserId = userRes.data.data.id;

    res.send(`<script>window.opener.postMessage('oauth_success', '*'); window.close();</script>`);
  } catch (error) {
    console.error('Twitter OAuth Error:', error.response?.data || error.message);
    res.status(500).send('OAuth failed');
  }
});

module.exports = router;
