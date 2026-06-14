// api/guests.js — GET /api/guests  (admin list)
//                  DELETE /api/guests/:id
import { getDb } from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db  = await getDb();
    const col = db.collection('rsvps');

    // ── GET: list all RSVPs ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      const rsvps = await col
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      // Stringify _id for the client
      const serialized = rsvps.map(r => ({
        ...r,
        _id: r._id.toString(),
      }));
      return res.status(200).json({ rsvps: serialized });
    }

    // ── DELETE: remove one RSVP ──────────────────────────────────────────────
    if (req.method === 'DELETE') {
      // Extract id from URL path: /api/guests/[id]
      const id = req.query.id || req.url.split('/').pop();
      if (!id) return res.status(400).json({ error: 'ID required' });

      try {
        await col.deleteOne({ _id: new ObjectId(id) });
      } catch {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Guests API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
