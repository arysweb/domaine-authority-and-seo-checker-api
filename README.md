# Domain Authority & SEO Checker API

> **Spotlight Title:** Domain Authority & SEO Checker — Instant DA Scores, Backlinks & Spam Analysis

---

## Short Description

Retrieve domain authority scores (0–100), backlink profiles, spam toxicity ratings, Core Web Vitals, and top organic keywords for any domain — in a single API call. Built for SEO agencies, SaaS dashboards, and automated link-building pipelines.

---

## Long Description

The **Domain Authority & SEO Checker API** gives developers and agencies instant access to the SEO metrics that matter most — without scraping, rate limits from third-party tools, or expensive subscriptions to enterprise platforms.

### What You Get

| Feature | Description |
|---|---|
| **Authority Score (0–100)** | Calibrated domain authority with letter grade (A+–F), percentile ranking, trust flow, and citation flow |
| **Backlink Intelligence** | Total backlinks, referring domain count, dofollow/nofollow split, and top anchor text distribution |
| **Spam Score Detection** | 14-point toxicity analysis with manual action risk flag — protect your link-building campaigns |
| **SEO Health Audit** | HTTPS status, mobile-friendliness, page load time, Core Web Vitals (LCP, FID, CLS), meta tags, and structured data |
| **Bulk Endpoint** | Analyze up to 50 competitor domains in a single POST request |
| **Top Organic Keywords** | Top-ranking keywords with estimated traffic and SERP feature presence, filterable by country |

### Who Is It For?

- SEO agencies automating client reporting
- SaaS platforms embedding SEO data into dashboards
- Link-building tools that need pre-outreach spam checks
- Developers building niche SEO tools and Chrome extensions

### Performance & Reliability

Served from edge nodes via Cloudflare Workers. Average latency under 100ms globally. 99.9% uptime SLA on Pro and Enterprise plans. All responses are cached at the edge with a 24-hour TTL to maximize speed and minimize redundant data fetching.

---

## Category

**Data → Web Scraping & SEO**

## Tags

`SEO` `Domain Authority` `Backlinks` `Web Scraping` `Digital Marketing` `Link Building` `Spam Score` `Page Rank` `SERP` `Site Audit` `Agency Tools` `Analytics`

---

## Endpoints

| Method | Endpoint | Description | Credits |
|---|---|---|---|
| GET | `/domain/authority` | DA score, grade, trust/citation flow | 1 |
| GET | `/domain/backlinks` | Backlink count, referring domains, anchors | 2 |
| GET | `/domain/spam-score` | Spam score, risk level, signal breakdown | 1 |
| GET | `/domain/seo-health` | HTTPS, mobile, CWV, meta tags | 3 |
| POST | `/domain/bulk` | Analyze up to 50 domains in one call | 1/domain |
| GET | `/domain/keywords` | Top organic keywords + traffic estimates | 2 |

---

## Authentication

All requests require your RapidAPI key in the request header:

```
X-RapidAPI-Key: YOUR_KEY_HERE
X-RapidAPI-Host: domain-seo-checker.p.rapidapi.com
```

---

## Quick Start

### cURL
```bash
curl --request GET \
  --url 'https://domain-seo-checker.p.rapidapi.com/domain/authority?domain=example.com' \
  --header 'X-RapidAPI-Host: domain-seo-checker.p.rapidapi.com' \
  --header 'X-RapidAPI-Key: YOUR_API_KEY'
```

### JavaScript (fetch)
```javascript
const response = await fetch(
  'https://domain-seo-checker.p.rapidapi.com/domain/authority?domain=example.com',
  {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'domain-seo-checker.p.rapidapi.com',
      'X-RapidAPI-Key': 'YOUR_API_KEY'
    }
  }
);
const data = await response.json();
console.log(data.authority_score); // e.g. 74
```

### Python
```python
import requests

url = "https://domain-seo-checker.p.rapidapi.com/domain/authority"
headers = {
    "X-RapidAPI-Host": "domain-seo-checker.p.rapidapi.com",
    "X-RapidAPI-Key": "YOUR_API_KEY"
}
params = {"domain": "example.com"}

res = requests.get(url, headers=headers, params=params)
print(res.json()["authority_score"])
```

### PHP (Guzzle)
```php
<?php
$client = new GuzzleHttp\Client();
$response = $client->request('GET',
  'https://domain-seo-checker.p.rapidapi.com/domain/authority',
  ['headers' => [
    'X-RapidAPI-Host' => 'domain-seo-checker.p.rapidapi.com',
    'X-RapidAPI-Key'  => 'YOUR_API_KEY'
  ],
  'query' => ['domain' => 'example.com']]
);
$data = json_decode($response->getBody(), true);
echo $data['authority_score'];
```

---

## Example Responses

### GET /domain/authority
```json
{
  "domain": "example.com",
  "authority_score": 74,
  "grade": "B+",
  "percentile": 88.4,
  "page_authority": 68,
  "trust_flow": 52,
  "citation_flow": 61,
  "last_updated": "2026-03-29T12:00:00Z"
}
```

### GET /domain/backlinks
```json
{
  "total_backlinks": 142830,
  "referring_domains": 8421,
  "dofollow": 79420,
  "nofollow": 63410,
  "top_anchors": [
    { "text": "click here", "count": 4200 },
    { "text": "example.com", "count": 3100 }
  ]
}
```

### GET /domain/spam-score
```json
{
  "spam_score": 12,
  "risk_level": "low",
  "manual_action_risk": false,
  "signals": [
    { "signal": "thin_content", "triggered": false },
    { "signal": "exact_match_anchors", "triggered": true },
    { "signal": "low_quality_links", "triggered": false }
  ]
}
```

### GET /domain/seo-health
```json
{
  "https": true,
  "mobile_friendly": true,
  "load_time_ms": 1240,
  "lcp": "good",
  "fid": "good",
  "cls": "needs_improvement",
  "meta_title": true,
  "meta_description": true,
  "structured_data": true
}
```

---

## Pricing

| Plan | Price | Requests/Day | Endpoints |
|---|---|---|---|
| **Free** | $0/mo | 100 | `/authority` only |
| **Pro** | $29/mo | 10,000 | All 6 endpoints |
| **Enterprise** | $149/mo | Unlimited | All + bulk up to 50 |

### Pay-As-You-Go (per call)

| Endpoint | Cost |
|---|---|
| /domain/authority | $0.002 |
| /domain/backlinks | $0.004 |
| /domain/spam-score | $0.002 |
| /domain/seo-health | $0.006 |
| /domain/bulk (per domain) | $0.001 |
| /domain/keywords | $0.004 |

---

## Error Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Invalid domain format |
| 401 | Missing or invalid API key |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Support

- RapidAPI Discussion Board: linked on the API listing page
- Email: support@your-api.com
- Response time: within 24 hours on Pro/Enterprise plans
