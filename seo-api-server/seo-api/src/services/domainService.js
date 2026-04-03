const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Core domain data engine.
 * In production: replace stub calculations with real data sources:
 *   - Moz API for DA/PA
 *   - Ahrefs/Majestic for backlinks
 *   - Google PageSpeed Insights API for CWV
 *   - SEMrush API for keywords
 * The architecture stays identical — just swap the data sources below.
 */

function normalizeDomain(input) {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.replace(/^www\./i, '');
  domain = domain.split('/')[0];
  if (!domain || domain.length < 3 || !domain.includes('.')) {
    throw new Error(`Invalid domain: "${input}"`);
  }
  return domain;
}

// Deterministic hash for consistent mock data per domain
function hashDomain(domain) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash) + domain.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seeded(hash, min, max) {
  const range = max - min;
  return min + (hash % range);
}

function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 75) return 'A-';
  if (score >= 70) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 60) return 'B-';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

function getCwvRating(value, thresholds) {
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs_improvement';
  return 'poor';
}

async function fetchWithTimeout(urlStr, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', reject);
  });
}

// ── Authority ─────────────────────────────────────────────────────────────────

async function getAuthority(domain, includeHistory = false) {
  const d = normalizeDomain(domain);
  const h = hashDomain(d);

  const score = seeded(h, 15, 92);
  const pa = Math.max(10, score - seeded(h + 1, 2, 12));
  const trust = seeded(h + 2, 10, score - 5);
  const citation = seeded(h + 3, trust - 5, trust + 20);
  const percentile = parseFloat((seeded(h + 4, 300, 999) / 10).toFixed(1));

  const result = {
    domain: d,
    authority_score: score,
    grade: getGrade(score),
    percentile,
    page_authority: pa,
    trust_flow: trust,
    citation_flow: Math.min(100, citation),
    last_updated: new Date(Date.now() - seeded(h, 0, 86400000)).toISOString()
  };

  if (includeHistory) {
    result.history = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().slice(0, 7),
      score: Math.max(10, score + seeded(h + i, -8, 8) - 4)
    }));
  }

  return result;
}

// ── Backlinks ─────────────────────────────────────────────────────────────────

async function getBacklinks(domain, limit = 10, filter = 'all') {
  const d = normalizeDomain(domain);
  const h = hashDomain(d);

  const total = seeded(h, 500, 500000);
  const dofollow = Math.floor(total * (0.4 + (h % 30) / 100));
  const nofollow = total - dofollow;

  const anchors = [
    'click here', d, 'read more', 'learn more', 'visit site',
    'more info', d.split('.')[0], 'source', 'via', 'reference',
    'full article', 'see here', 'this post', 'original article', 'link'
  ];

  const topAnchors = anchors.slice(0, Math.min(limit, anchors.length)).map((text, i) => ({
    text,
    count: Math.max(10, Math.floor(total / (i + 1) / 10))
  }));

  const base = {
    domain: d,
    total_backlinks: total,
    referring_domains: Math.floor(total / seeded(h + 1, 8, 25)),
    last_updated: new Date().toISOString()
  };

  if (filter === 'dofollow') return { ...base, dofollow, top_anchors: topAnchors };
  if (filter === 'nofollow') return { ...base, nofollow, top_anchors: topAnchors };
  return { ...base, dofollow, nofollow, top_anchors: topAnchors };
}

// ── Spam Score ────────────────────────────────────────────────────────────────

async function getSpamScore(domain) {
  const d = normalizeDomain(domain);
  const h = hashDomain(d);

  const score = seeded(h + 7, 0, 60);
  const riskLevel = score < 20 ? 'low' : score < 45 ? 'medium' : 'high';

  const signalNames = [
    'thin_content', 'exact_match_anchors', 'low_quality_links', 'high_external_links',
    'no_contact_page', 'keyword_stuffing', 'cloaking_detected', 'hidden_text',
    'link_schemes', 'duplicate_content', 'scraped_content', 'doorway_pages',
    'user_generated_spam', 'unnatural_links'
  ];

  const triggeredCount = Math.floor(score / 7);
  const signals = signalNames.map((signal, i) => ({
    signal,
    triggered: i < triggeredCount
  }));

  return {
    domain: d,
    spam_score: score,
    risk_level: riskLevel,
    manual_action_risk: score > 50,
    signals,
    checked_at: new Date().toISOString()
  };
}

// ── SEO Health ────────────────────────────────────────────────────────────────

async function getSeoHealth(domain, includeVitals = true) {
  const d = normalizeDomain(domain);
  const h = hashDomain(d);

  // Try a real HEAD request to check HTTPS
  let httpsOk = true;
  let loadTimeMs = seeded(h + 5, 400, 4500);
  try {
    const res = await fetchWithTimeout(`https://${d}`, 5000);
    httpsOk = res.status < 400;
    // Crude timing not available via HEAD — use mock
  } catch {
    httpsOk = seeded(h, 0, 10) > 2; // Most domains do have HTTPS
  }

  const lcp = seeded(h + 1, 800, 4500);
  const fid = seeded(h + 2, 10, 400);
  const cls = parseFloat((seeded(h + 3, 0, 60) / 100).toFixed(2));

  const result = {
    domain: d,
    https: httpsOk,
    mobile_friendly: seeded(h + 4, 0, 10) > 2,
    load_time_ms: loadTimeMs,
    meta_title: seeded(h + 6, 0, 10) > 1,
    meta_description: seeded(h + 7, 0, 10) > 2,
    structured_data: seeded(h + 8, 0, 10) > 4,
    robots_txt: seeded(h + 9, 0, 10) > 1,
    sitemap: seeded(h + 10, 0, 10) > 3,
    checked_at: new Date().toISOString()
  };

  if (includeVitals) {
    result.core_web_vitals = {
      lcp_ms: lcp,
      lcp_rating: getCwvRating(lcp, [2500, 4000]),
      fid_ms: fid,
      fid_rating: getCwvRating(fid, [100, 300]),
      cls_score: cls,
      cls_rating: getCwvRating(cls, [0.1, 0.25])
    };
  }

  return result;
}

// ── Keywords ──────────────────────────────────────────────────────────────────

async function getKeywords(domain, limit = 20, country = 'us') {
  const d = normalizeDomain(domain);
  const h = hashDomain(d);
  const base = d.split('.')[0];

  const kws = [
    `${base}`, `${base} review`, `what is ${base}`, `${base} pricing`,
    `${base} alternatives`, `${base} vs competitor`, `best ${base}`,
    `how to use ${base}`, `${base} tutorial`, `${base} login`,
    `${base} api`, `${base} features`, `${base} free`, `${base} pro`,
    `${base} download`, `${base} documentation`, `${base} examples`,
    `${base} guide`, `${base} comparison`, `${base} discount`,
    `${base} coupon`, `${base} integration`, `${base} support`,
    `${base} blog`, `${base} news`
  ].slice(0, limit);

  const serpFeatures = ['featured_snippet', 'local_pack', 'image_pack', 'video_carousel', 'people_also_ask'];

  const keywords = kws.map((kw, i) => {
    const kwHash = hashDomain(kw);
    const vol = seeded(kwHash, 100, 50000);
    const pos = seeded(kwHash + 1, 1, 30);
    const ctr = pos <= 3 ? 0.25 : pos <= 10 ? 0.08 : 0.02;
    return {
      keyword: kw,
      position: pos,
      search_volume: vol,
      traffic_estimate: Math.floor(vol * ctr),
      cpc_usd: parseFloat((seeded(kwHash + 2, 20, 800) / 100).toFixed(2)),
      serp_features: seeded(kwHash + 3, 0, 10) > 6
        ? [serpFeatures[kwHash % serpFeatures.length]]
        : []
    };
  });

  keywords.sort((a, b) => b.traffic_estimate - a.traffic_estimate);

  return {
    domain: d,
    country,
    total_keywords: seeded(h, 200, 15000),
    keywords,
    fetched_at: new Date().toISOString()
  };
}

// ── Bulk ──────────────────────────────────────────────────────────────────────

async function bulkAnalyze(domains, metrics = ['authority']) {
  const results = await Promise.all(domains.map(async (domain) => {
    try {
      const result = { domain: normalizeDomain(domain) };
      if (metrics.includes('authority')) result.authority = await getAuthority(domain);
      if (metrics.includes('backlinks')) result.backlinks = await getBacklinks(domain);
      if (metrics.includes('spam')) result.spam = await getSpamScore(domain);
      if (metrics.includes('health')) result.health = await getSeoHealth(domain);
      return result;
    } catch (err) {
      return { domain, error: err.message };
    }
  }));
  return { results, total: results.length, fetched_at: new Date().toISOString() };
}

module.exports = {
  normalizeDomain,
  getAuthority,
  getBacklinks,
  getSpamScore,
  getSeoHealth,
  getKeywords,
  bulkAnalyze
};
