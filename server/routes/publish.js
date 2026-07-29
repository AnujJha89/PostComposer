const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  const { content, platforms } = req.body;
  const results = {};
  
  if (!content) return res.status(400).json({ error: 'Content is required' });

  // Publish to Twitter
  if (platforms.includes('TWITTER')) {
    if (!req.session.twitterToken) {
      results.TWITTER = { status: 'failed', error: 'Not connected' };
    } else if (req.session.twitterToken === 'demo_twitter_token') {
      results.TWITTER = { status: 'published', id: 'demo_tweet_123' };
    } else {
      try {
        const response = await axios.post('https://api.twitter.com/2/tweets', { text: content }, {
          headers: { 'Authorization': `Bearer ${req.session.twitterToken}` }
        });
        results.TWITTER = { status: 'published', id: response.data.data.id };
      } catch (err) {
        results.TWITTER = { status: 'failed', error: err.response?.data?.detail || err.message };
      }
    }
  }

  // Publish to LinkedIn
  if (platforms.includes('LINKEDIN')) {
    if (!req.session.linkedinToken || !req.session.linkedinPersonUrn) {
      results.LINKEDIN = { status: 'failed', error: 'Not connected' };
    } else if (req.session.linkedinToken === 'demo_linkedin_token') {
      results.LINKEDIN = { status: 'published', id: 'demo_linkedin_post_123' };
    } else {
      try {
        const payload = {
          author: req.session.linkedinPersonUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: content },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        };
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', payload, {
          headers: { 'Authorization': `Bearer ${req.session.linkedinToken}`, 'X-Restli-Protocol-Version': '2.0.0' }
        });
        results.LINKEDIN = { status: 'published', id: response.headers['x-restli-id'] };
      } catch (err) {
        results.LINKEDIN = { status: 'failed', error: err.response?.data?.message || err.message };
      }
    }
  }

  // Publish to Facebook
  if (platforms.includes('FACEBOOK')) {
    if (!req.session.facebookToken || !req.session.facebookPages || req.session.facebookPages.length === 0) {
      results.FACEBOOK = { status: 'failed', error: 'Not connected or no pages available' };
    } else if (req.session.facebookToken === 'demo_facebook_token') {
      results.FACEBOOK = { status: 'published', id: 'demo_fb_post_123' };
    } else {
      try {
        const pageId = req.session.facebookPages[0].id; // post to the first page
        const response = await axios.post(`https://graph.facebook.com/v17.0/${pageId}/feed`, {
          message: content,
          access_token: req.session.facebookToken
        });
        results.FACEBOOK = { status: 'published', id: response.data.id };
      } catch (err) {
        results.FACEBOOK = { status: 'failed', error: err.response?.data?.error?.message || err.message };
      }
    }
  }

  res.json({ results });
});

module.exports = router;
