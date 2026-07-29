const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL;

router.get('/login', (req, res) => {
  if (!CLIENT_ID) {
    // DEMO MODE
    return res.json({ url: 'http://localhost:3001/auth/linkedin/callback?code=demo_code&state=demo_state' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.linkedinState = state;

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&state=${state}&scope=r_liteprofile%20w_member_social`;
  
  res.json({ url: authUrl });
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // DEMO MODE
  if (code === 'demo_code') {
    req.session.linkedinToken = 'demo_linkedin_token';
    req.session.linkedinName = 'Demo Professional';
    req.session.linkedinPersonUrn = 'urn:li:person:demo123';
    return res.send(`<script>window.opener.postMessage('oauth_success', '*'); window.close();</script>`);
  }

  if (state !== req.session.linkedinState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: CALLBACK_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    req.session.linkedinToken = response.data.access_token;

    // Fetch user info
    const userRes = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${req.session.linkedinToken}` }
    });
    
    req.session.linkedinName = `${userRes.data.localizedFirstName} ${userRes.data.localizedLastName}`;
    req.session.linkedinPersonUrn = `urn:li:person:${userRes.data.id}`;

    res.send(`<script>window.opener.postMessage('oauth_success', '*'); window.close();</script>`);
  } catch (error) {
    console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
    res.status(500).send('OAuth failed');
  }
});

module.exports = router;
