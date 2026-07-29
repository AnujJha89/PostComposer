const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

const CLIENT_ID = process.env.FACEBOOK_APP_ID;
const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;
const CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL;

router.get('/login', (req, res) => {
  if (!CLIENT_ID) {
    // DEMO MODE
    return res.json({ url: 'http://localhost:3001/auth/facebook/callback?code=demo_code&state=demo_state' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.facebookState = state;

  const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;
  
  res.json({ url: authUrl });
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  // DEMO MODE
  if (code === 'demo_code') {
    req.session.facebookToken = 'demo_facebook_token';
    req.session.facebookPages = [{ id: 'demo_page_id', name: 'Demo Facebook Page' }];
    return res.send(`<script>window.opener.postMessage('oauth_success', '*'); window.close();</script>`);
  }
  
  if (state !== req.session.facebookState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const response = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: CALLBACK_URL,
        code,
      }
    });

    const userToken = response.data.access_token;

    // Fetch user's pages to get page access tokens
    const pagesRes = await axios.get('https://graph.facebook.com/v17.0/me/accounts', {
      params: { access_token: userToken }
    });
    
    // Store the first page token as default, or store all
    const pages = pagesRes.data.data;
    if (pages.length > 0) {
      req.session.facebookToken = pages[0].access_token;
      req.session.facebookPages = pages.map(p => ({ id: p.id, name: p.name }));
    } else {
      console.warn('No pages found for this Facebook user');
    }

    res.send(`<script>window.opener.postMessage('oauth_success', '*'); window.close();</script>`);
  } catch (error) {
    console.error('Facebook OAuth Error:', error.response?.data || error.message);
    res.status(500).send('OAuth failed');
  }
});

module.exports = router;
