import { isOwnerRequest, isValidOwnerCode, setOwnerAccessCookie } from './_access.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: isOwnerRequest(req) });
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!isValidOwnerCode(body?.code)) {
      return res.status(401).json({ error: 'Invalid owner code' });
    }

    setOwnerAccessCookie(req, res);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
