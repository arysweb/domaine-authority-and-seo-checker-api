const express = require('express');
const router = express.Router();
const { getBacklinks } = require('../services/domainService');

router.get('/', async (req, res) => {
  const { domain, limit, filter } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required query param: domain', status_code: 400 });
  }

  const parsedLimit = parseInt(limit) || 10;
  if (parsedLimit < 1 || parsedLimit > 50) {
    return res.status(400).json({ error: 'Bad Request', message: 'limit must be between 1 and 50', status_code: 400 });
  }

  const validFilters = ['all', 'dofollow', 'nofollow'];
  if (filter && !validFilters.includes(filter)) {
    return res.status(400).json({ error: 'Bad Request', message: `filter must be one of: ${validFilters.join(', ')}`, status_code: 400 });
  }

  try {
    const data = await getBacklinks(domain, parsedLimit, filter || 'all');
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request', message: err.message, status_code: 400 });
  }
});

module.exports = router;
