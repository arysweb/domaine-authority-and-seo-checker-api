const express = require('express');
const router = express.Router();
const { getAuthority } = require('../services/domainService');

router.get('/', async (req, res) => {
  const { domain, include_history } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required query param: domain', status_code: 400 });
  }

  try {
    const data = await getAuthority(domain, include_history === 'true');
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: 'Bad Request', message: err.message, status_code: 400 });
  }
});

module.exports = router;
