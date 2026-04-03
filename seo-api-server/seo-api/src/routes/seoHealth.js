const express = require('express');
const router = express.Router();
const { getSeoHealth } = require('../services/domainService');

router.get('/', async (req, res) => {
  const { domain, include_vitals } = req.query;
  if (!domain) return res.status(400).json({ error: 'Bad Request', message: 'Missing required query param: domain', status_code: 400 });
  try {
    res.json(await getSeoHealth(domain, include_vitals !== 'false'));
  } catch (err) {
    res.status(400).json({ error: 'Bad Request', message: err.message, status_code: 400 });
  }
});

module.exports = router;
