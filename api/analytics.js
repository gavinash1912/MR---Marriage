// api/analytics.js — POST: log analytics events, GET: retrieve analytics
import { getDb } from './_db.js';

function firstHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeIp(value) {
  const raw = firstHeaderValue(value);
  if (!raw) return 'unknown';

  let ip = String(raw).split(',')[0].trim();
  if (!ip) return 'unknown';

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  if (ip.startsWith('[')) {
    const endBracket = ip.indexOf(']');
    if (endBracket !== -1) {
      ip = ip.slice(1, endBracket);
    }
  } else {
    const ipv4WithPort = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
    if (ipv4WithPort) {
      ip = ipv4WithPort[1];
    }
  }

  return ip || 'unknown';
}

function getClientIp(req) {
  const candidates = [
    req.headers['cf-connecting-ip'],
    req.headers['true-client-ip'],
    req.headers['x-real-ip'],
    req.headers['x-vercel-forwarded-for'],
    req.headers['x-forwarded-for'],
    req.headers['x-client-ip'],
    req.socket?.remoteAddress,
  ];

  for (const candidate of candidates) {
    const ip = normalizeIp(candidate);
    if (ip !== 'unknown') return ip;
  }

  return 'unknown';
}

function isPrivateIp(ip) {
  if (!ip || ip === 'unknown') return true;

  const lowerIp = ip.toLowerCase();
  if (
    lowerIp === '::1' ||
    lowerIp.startsWith('fc') ||
    lowerIp.startsWith('fd') ||
    lowerIp.startsWith('fe80:')
  ) {
    return true;
  }

  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some(octet => Number.isNaN(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function formatLocation(city, country) {
  return [city, country].filter(Boolean).join(', ') || null;
}

function getKeyCdnUserAgent() {
  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://aa-engagement.vercel.app';

  return `keycdn-tools:${siteUrl}`;
}

async function getLocationFromIP(ip) {
  if (isPrivateIp(ip)) {
    console.log('Skipping geolocation for IP:', ip);
    return null;
  }

  const encodedIp = encodeURIComponent(ip);
  const providers = [
    {
      name: 'ipwho.is',
      url: `https://ipwho.is/${encodedIp}`,
      parse: data => data?.success ? formatLocation(data.city, data.country) : null,
    },
    {
      name: 'KeyCDN',
      url: `https://tools.keycdn.com/geo.json?host=${encodedIp}`,
      options: {
        headers: {
          'User-Agent': getKeyCdnUserAgent(),
        },
      },
      parse: data => {
        const geo = data?.data?.geo || data?.body?.geo;
        return data?.status === 'success' ? formatLocation(geo?.city, geo?.country_name) : null;
      },
    },
  ];

  for (const provider of providers) {
    try {
      console.log(`Attempting geolocation with ${provider.name} for IP:`, ip);
      const data = await fetchJson(provider.url, provider.options);
      const location = provider.parse(data);

      if (location) {
        console.log(`Resolved location with ${provider.name}:`, location);
        return location;
      }

      console.log(`${provider.name} did not return a location for IP:`, ip);
    } catch (err) {
      console.error(`${provider.name} location lookup error:`, err.message);
    }
  }

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDb();
    const col = db.collection('analytics');

    // ── POST: log an event ───────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { eventType, sessionId, userId, deviceInfo } = req.body;
      if (!eventType || !sessionId) {
        return res.status(400).json({ error: 'eventType and sessionId required' });
      }

      const ipAddress = getClientIp(req);
      console.log('Captured IP:', ipAddress, 'Headers:', {
        'cf-connecting-ip': req.headers['cf-connecting-ip'],
        'true-client-ip': req.headers['true-client-ip'],
        'x-real-ip': req.headers['x-real-ip'],
        'x-vercel-forwarded-for': req.headers['x-vercel-forwarded-for'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-client-ip': req.headers['x-client-ip'],
      });

      const location = await getLocationFromIP(ipAddress);
      console.log('Resolved location:', location);

      await col.insertOne({
        eventType,
        sessionId,
        userId: userId || null,
        ipAddress,
        location,
        deviceInfo: deviceInfo || null,
        timestamp: new Date(),
      });
      return res.status(200).json({ success: true });
    }

    // ── GET: retrieve analytics ─────────────────────────────────────────────
    if (req.method === 'GET') {
      // Check for detailed visitor logs first
      if (req.query.details === 'true') {
        const events = await col
          .find({ eventType: 'page_view' })
          .sort({ timestamp: -1 })
          .toArray();

        const visitors = [];
        const seenSessions = new Set();

        events.forEach(event => {
          if (!seenSessions.has(event.sessionId)) {
            seenSessions.add(event.sessionId);
            visitors.push({
              sessionId: event.sessionId,
              visitorName: event.visitorName || 'Anonymous',
              ipAddress: event.ipAddress,
              location: event.location,
              deviceInfo: event.deviceInfo,
              visitedAt: event.timestamp,
            });
          }
        });

        return res.status(200).json({ visitors });
      }

      // Default: return analytics summary
      const allEvents = await col.find({}).toArray();

      const pageViews = allEvents.filter(e => e.eventType === 'page_view').length;
      const uniquePageViewSessions = new Set(
        allEvents.filter(e => e.eventType === 'page_view').map(e => e.sessionId)
      ).size;

      const videoPlays = allEvents.filter(e => e.eventType === 'video_play').length;
      const uniqueVideoSessions = new Set(
        allEvents.filter(e => e.eventType === 'video_play').map(e => e.sessionId)
      ).size;

      return res.status(200).json({
        totalPageViews: pageViews,
        uniqueVisitors: uniquePageViewSessions,
        totalVideoPlays: videoPlays,
        uniqueVideoViewers: uniqueVideoSessions,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Analytics API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
