// api/guests.js
// GET    /api/guests          → list all RSVPs
// DELETE /api/guests?id=:id   → delete one
// PATCH  /api/guests?id=:id   → update one
import { getDb } from './_db.js';
import { ObjectId } from 'mongodb';
import { requireOwnerAccess, siteIsInactive } from './_access.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (siteIsInactive() && !requireOwnerAccess(req, res)) return;

  try {
    const db  = await getDb();
    const col = db.collection('rsvps');

    // ── GET: list all ───────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const rsvps = await col.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json({
        rsvps: rsvps.map(r => ({ ...r, _id: r._id.toString() })),
      });
    }

    // ── DELETE: remove one ──────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });

      let oid;
      try { oid = new ObjectId(id); }
      catch { return res.status(400).json({ error: 'Invalid ID' }); }

      const result = await col.deleteOne({ _id: oid });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      return res.status(200).json({ success: true });
    }

    // ── PATCH: update one ───────────────────────────────────────────────────
    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID required' });

      let oid;
      try { oid = new ObjectId(id); }
      catch { return res.status(400).json({ error: 'Invalid ID' }); }

      const updates = { ...req.body };
      delete updates._id;

      await col.updateOne(
        { _id: oid },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Guests API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
