// api/_db.js — shared MongoDB connection (reused across serverless invocations)
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!uri) {
  // No DB configured — return a stub so the API gracefully falls back
  clientPromise = null;
} else {
  if (process.env.NODE_ENV === 'development') {
    // In dev, reuse the connection across hot-reloads
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getDb() {
  if (!clientPromise) throw new Error('MONGODB_URI is not set');
  const c = await clientPromise;
  return c.db(process.env.MONGODB_DB || 'marriage');
}

export default clientPromise;
