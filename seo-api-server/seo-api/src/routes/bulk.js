const express = require('express');
const router = express.Router();
const { bulkAnalyze } = require('../services/domainService');

router.post('/', async (req, res) => {
  const { domains, metrics } = req.body;

  if (!domains || !Array.isArray(domains) || domains.length === 0) {
    return res.status(400).json({ error: 'Bad Request', message: 'Body must include a non-empty domains array', status_code: 400 });
  }

  const maxBulk = req.plan?.bulkMax || 0;
  if (maxBulk === 0) {
    return res.status(403).json({ error: 'Forbidden', message: 'Bulk endpoint requires Pro or Enterprise plan', status_code: 403, upgrade_url: 'https://rapidapi.com/your-api' });
  }

  if (domains.length > maxBulk) {
    return res.status(400).json({ error: 'Bad Request', message: `Your plan allows max ${maxBulk} domains per bulk request`, status_code: 400 });
  }

  const validMetrics = ['authority', 'backlinks', 'spam', 'health'];
  const requestedMetrics = metrics || ['authority'];
  const invalidMetrics = requestedMetrics.filter(m => !validMetrics.includes(m));
  if (invalidMetrics.length > 0) {
    return res.status(400).json({ error: 'Bad Request', message: `Invalid metrics: ${invalidMetrics.join(', ')}. Valid: ${validMetrics.join(', ')}`, status_code: 400 });
  }

  try {
    res.json(await bulkAnalyze(domains, requestedMetrics));
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message, status_code: 500 });
  }
});

module.exports = router;
