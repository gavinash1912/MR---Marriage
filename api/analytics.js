// api/analytics.js — POST: log analytics events, GET: retrieve analytics
import { getDb } from './_db.js';

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['cf-connecting-ip'] ||
    req.headers['x-client-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

async function getLocationFromIP(ip) {
  if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
    return null;
  }
  try {
    const res = await fetch(`https://ip-api.com/json/${ip}?fields=country,city`);
    const data = await res.json();
    if (data.status === 'success') {
      return `${data.city}, ${data.country}`;
    }
  } catch (err) {
    console.error('Location lookup error:', err);
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
      const location = await getLocationFromIP(ipAddress);

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
