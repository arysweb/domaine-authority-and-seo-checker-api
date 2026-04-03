const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { authRouter } = require('./middleware/auth');
const authorityRouter = require('./routes/authority');
const backlinksRouter = require('./routes/backlinks');
const spamRouter = require('./routes/spam');
const healthRouter = require('./routes/seoHealth');
const bulkRouter = require('./routes/bulk');
const keywordsRouter = require('./routes/keywords');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global rate limiter (per IP fallback)
const globalLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100,
  message: { error: 'Rate limit exceeded', message: 'Free tier: 100 requests/day. Upgrade at rapidapi.com', status_code: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth middleware (validates X-RapidAPI-Key and sets req.plan)
app.use(authRouter);

// Routes
app.use('/domain/authority', authorityRouter);
app.use('/domain/backlinks', backlinksRouter);
app.use('/domain/spam-score', spamRouter);
app.use('/domain/seo-health', healthRouter);
app.use('/domain/bulk', bulkRouter);
app.use('/domain/keywords', keywordsRouter);

// Health check
app.get('/ping', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found', message: `Route ${req.path} does not exist`, status_code: 404 }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message, status_code: 500 });
});

app.listen(PORT, () => console.log(`SEO API running on port ${PORT}`));

module.exports = app;
