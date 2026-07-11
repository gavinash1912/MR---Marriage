// api/rsvp.js — POST /api/rsvp  — save a new RSVP
import { getDb } from './_db.js';
import { isOwnerRequest, siteIsInactive } from './_access.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (siteIsInactive() && !isOwnerRequest(req)) {
    return res.status(403).json({ error: 'RSVP submissions are closed' });
  }

  try {
    const body = req.body;

    // Basic validation
    const { primaryGuest } = body;
    if (!primaryGuest?.firstName || !primaryGuest?.lastName) {
      return res.status(400).json({ error: 'First and last name are required' });
    }
    if (!['yes', 'no'].includes(primaryGuest.attending)) {
      return res.status(400).json({ error: 'Attendance response is required' });
    }

    const db = await getDb();
    const col = db.collection('rsvps');

    const doc = {
      ...body,
      submittedAt: body.submittedAt || new Date().toISOString(),
      createdAt:   new Date(),
    };

    const result = await col.insertOne(doc);
    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error('RSVP error:', err);
    return res.status(500).json({ error: 'Failed to save RSVP. Please try again.' });
  }
}
