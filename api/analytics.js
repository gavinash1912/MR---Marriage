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

function getTimeFilterStart(timeFilter) {
  const value = Array.isArray(timeFilter) ? timeFilter[0] : timeFilter;
  const start = new Date();

  switch (value) {
    case '15m':
      start.setMinutes(start.getMinutes() - 15);
      return start;
    case '30m':
      start.setMinutes(start.getMinutes() - 30);
      return start;
    case '1h':
      start.setHours(start.getHours() - 1);
      return start;
    case '6h':
      start.setHours(start.getHours() - 6);
      return start;
    case '1d':
      start.setDate(start.getDate() - 1);
      return start;
    default:
      return null;
  }
}

function getVisitorKey(event) {
  if (event.ipAddress && event.ipAddress !== 'unknown') {
    return `ip:${event.ipAddress}|device:${event.deviceInfo || 'unknown'}`;
  }

  return event.sessionId ? `session:${event.sessionId}` : `event:${event._id}`;
}

function sanitizeDurationSeconds(value) {
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < 0) return 0;
  return Math.min(Math.round(duration), 24 * 60 * 60);
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
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const {
        eventType,
        sessionId,
        userId,
        deviceInfo,
        visitId,
        pagePath,
        actionName,
        actionLabel,
        durationSeconds,
        metadata,
      } = body || {};
      if (!eventType || !sessionId) {
        return res.status(400).json({ error: 'eventType and sessionId required' });
      }

      if (eventType === 'duration_update') {
        if (!visitId) {
          return res.status(400).json({ error: 'visitId required for duration_update' });
        }

        await col.updateOne(
          { eventType: 'page_view', visitId },
          {
            $max: { durationSeconds: sanitizeDurationSeconds(durationSeconds) },
            $set: { lastActiveAt: new Date() },
          }
        );

        return res.status(200).json({ success: true });
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

      const location = eventType === 'page_view' ? await getLocationFromIP(ipAddress) : null;
      console.log('Resolved location:', location);

      await col.insertOne({
        eventType,
        sessionId,
        visitId: visitId || null,
        userId: userId || null,
        ipAddress,
        location,
        deviceInfo: deviceInfo || null,
        pagePath: pagePath || null,
        actionName: actionName || null,
        actionLabel: actionLabel || null,
        metadata: metadata || null,
        durationSeconds: eventType === 'page_view' ? 0 : null,
        lastActiveAt: eventType === 'page_view' ? new Date() : null,
        timestamp: new Date(),
      });
      return res.status(200).json({ success: true });
    }

    // ── GET: retrieve analytics ─────────────────────────────────────────────
    if (req.method === 'GET') {
      const startTime = getTimeFilterStart(req.query.timeFilter);
      const timeQuery = startTime ? { timestamp: { $gte: startTime } } : {};

      // Check for detailed visitor logs first
      if (req.query.details === 'true') {
        const events = await col
          .find({ ...timeQuery, eventType: 'page_view' })
          .sort({ timestamp: -1 })
          .toArray();

        const visitIds = events.map(event => event.visitId).filter(Boolean);
        const actionEvents = visitIds.length
          ? await col
              .find({ visitId: { $in: visitIds }, eventType: { $ne: 'page_view' } })
              .sort({ timestamp: 1 })
              .toArray()
          : [];
        const actionsByVisitId = new Map();

        actionEvents.forEach(event => {
          if (!actionsByVisitId.has(event.visitId)) {
            actionsByVisitId.set(event.visitId, []);
          }

          actionsByVisitId.get(event.visitId).push({
            id: event._id?.toString(),
            eventType: event.eventType,
            actionName: event.actionName,
            actionLabel: event.actionLabel,
            metadata: event.metadata,
            timestamp: event.timestamp,
          });
        });

        const visitors = events.map(event => ({
          id: event._id?.toString(),
          visitId: event.visitId,
          sessionId: event.sessionId,
          visitorName: event.visitorName || 'Anonymous',
          ipAddress: event.ipAddress,
          location: event.location,
          deviceInfo: event.deviceInfo,
          pagePath: event.pagePath,
          durationSeconds: event.durationSeconds || 0,
          actions: actionsByVisitId.get(event.visitId) || [],
          visitedAt: event.timestamp,
        }));

        return res.status(200).json({ visitors });
      }

      // Default: return analytics summary
      const allEvents = await col.find(timeQuery).toArray();
      const pageViewEvents = allEvents.filter(e => e.eventType === 'page_view');
      const videoPlayEvents = allEvents.filter(e => e.eventType === 'video_play');

      const uniquePageViewVisitors = new Set(pageViewEvents.map(getVisitorKey)).size;
      const uniqueVideoViewers = new Set(videoPlayEvents.map(getVisitorKey)).size;

      return res.status(200).json({
        totalPageViews: pageViewEvents.length,
        uniqueVisitors: uniquePageViewVisitors,
        totalVideoPlays: videoPlayEvents.length,
        uniqueVideoViewers,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Analytics API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
