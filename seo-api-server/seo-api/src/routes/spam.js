// spam.js
const express = require('express');
const router = express.Router();
const { getSpamScore } = require('../services/domainService');

router.get('/', async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: 'Bad Request', message: 'Missing required query param: domain', status_code: 400 });
  try {
    res.json(await getSpamScore(domain));
  } catch (err) {
    res.status(400).json({ error: 'Bad Request', message: err.message, status_code: 400 });
  }
});

module.exports = router;
