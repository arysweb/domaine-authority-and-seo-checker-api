const express = require('express');
const router = express.Router();
const { getKeywords } = require('../services/domainService');

router.get('/', async (req, res) => {
  const { domain, limit, country } = req.query;
  if (!domain) return res.status(400).json({ error: 'Bad Request', message: 'Missing required query param: domain', status_code: 400 });

  const parsedLimit = parseInt(limit) || 20;
  if (parsedLimit < 1 || parsedLimit > 100) {
    return res.status(400).json({ error: 'Bad Request', message: 'limit must be between 1 and 100', status_code: 400 });
  }

  try {
    res.json(await getKeywords(domain, parsedLimit, country || 'us'));
  } catch (err) {
    res.status(400).json({ error: 'Bad Request', message: err.message, status_code: 400 });
  }
});

module.exports = router;
