// api/rsvp.js — POST /api/rsvp  — save a new RSVP
import { getDb } from './_db.js';
import { sendRsvpFallbackEmail } from './_emailFallback.js';

let indexesReady;

function ensureIndexes(col) {
  if (!indexesReady) {
    indexesReady = col.createIndex(
      { clientSubmissionId: 1 },
      { unique: true, sparse: true }
    ).catch(error => {
      indexesReady = null;
      throw error;
    });
  }

  return indexesReady;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    if (body.clientSubmissionId) {
      await ensureIndexes(col);
      try {
        const result = await col.updateOne(
          { clientSubmissionId: body.clientSubmissionId },
          { $setOnInsert: doc },
          { upsert: true }
        );
        return res.status(result.upsertedId ? 201 : 200).json({
          success: true,
          id: result.upsertedId?.toString?.() || body.clientSubmissionId,
          duplicate: !result.upsertedId,
        });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(200).json({
            success: true,
            id: body.clientSubmissionId,
            duplicate: true,
          });
        }
        throw error;
      }
    }

    const result = await col.insertOne(doc);
    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error('RSVP error:', err);
    const skipEmailFallback = req.headers['x-rsvp-skip-email-fallback'] === '1';

    if (!skipEmailFallback) {
      try {
        const fallback = await sendRsvpFallbackEmail(req.body, err);
        if (fallback.sent) {
          return res.status(202).json({
            success: true,
            storage: 'email_fallback',
            warning: 'RSVP was emailed as a backup because database storage failed.',
          });
        }
        console.warn('RSVP email fallback skipped:', fallback.reason);
      } catch (emailErr) {
        console.error('RSVP email fallback error:', emailErr);
      }
    }

    if (err.message === 'MONGODB_URI is not set') {
      return res.status(503).json({ error: 'RSVP storage requires MONGODB_URI to be configured.' });
    }
    return res.status(500).json({ error: 'Failed to save RSVP. Please try again.' });
  }
}
