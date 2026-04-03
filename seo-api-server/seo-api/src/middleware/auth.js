const express = require('express');
const router = express.Router();

// In production: validate against RapidAPI's proxy headers
// RapidAPI injects X-RapidAPI-User and X-RapidAPI-Subscription into every request
const PLAN_LIMITS = {
  free:       { requestsPerDay: 100,       bulkMax: 0,  endpoints: ['authority'] },
  basic:      { requestsPerDay: 1000,      bulkMax: 10, endpoints: ['authority','backlinks','spam','health','keywords'] },
  pro:        { requestsPerDay: 10000,     bulkMax: 20, endpoints: ['authority','backlinks','spam','health','keywords','bulk'] },
  enterprise: { requestsPerDay: Infinity,  bulkMax: 50, endpoints: ['authority','backlinks','spam','health','keywords','bulk'] },
};

// Simple in-memory usage tracker (use Redis in production)
const usageTracker = new Map();

function getPlan(req) {
  // RapidAPI sets X-RapidAPI-Subscription header with plan name
  const sub = req.headers['x-rapidapi-subscription'] || 'free';
  const planKey = sub.toLowerCase().replace(/[^a-z]/g, '');
  return PLAN_LIMITS[planKey] || PLAN_LIMITS['free'];
}

function getUsageKey(req) {
  const user = req.headers['x-rapidapi-user'] || req.ip;
  const today = new Date().toISOString().split('T')[0];
  return `${user}:${today}`;
}

function authRouter(req, res, next) {
  // Allow health check without auth
  if (req.path === '/ping') return next();

  const apiKey = req.headers['x-rapidapi-key'];
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing X-RapidAPI-Key header. Subscribe at rapidapi.com.',
      status_code: 401
    });
  }

  const plan = getPlan(req);
  const usageKey = getUsageKey(req);
  const currentUsage = usageTracker.get(usageKey) || 0;

  if (plan.requestsPerDay !== Infinity && currentUsage >= plan.requestsPerDay) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Your plan allows ${plan.requestsPerDay} requests/day. Upgrade for more.`,
      status_code: 429,
      upgrade_url: 'https://rapidapi.com/your-api'
    });
  }

  // Attach plan info to request
  req.plan = plan;
  req.rapidApiUser = req.headers['x-rapidapi-user'] || 'anonymous';

  // Increment usage counter
  usageTracker.set(usageKey, currentUsage + 1);

  // Clean up old keys periodically
  if (usageTracker.size > 10000) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    for (const [key] of usageTracker) {
      if (key.includes(yesterday)) usageTracker.delete(key);
    }
  }

  next();
}

module.exports = { authRouter, PLAN_LIMITS };
