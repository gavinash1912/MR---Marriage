// api/_db.js — shared MongoDB connection (reused across serverless invocations)
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  maxPoolSize: 5,
};

let client;
let clientPromise;

function connectClient() {
  if (!uri) return null;

  if (process.env.NODE_ENV === 'development') {
    // In dev, reuse the connection across hot-reloads.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, mongoOptions);
      global._mongoClientPromise = client.connect().catch(error => {
        global._mongoClientPromise = null;
        client = null;
        throw error;
      });
    }
    clientPromise = global._mongoClientPromise;
    return clientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri, mongoOptions);
    clientPromise = client.connect().catch(error => {
      clientPromise = null;
      client = null;
      throw error;
    });
  }

  return clientPromise;
}

export async function getDb() {
  const connection = connectClient();
  if (!connection) throw new Error('MONGODB_URI is not set');

  const c = await connection;
  return c.db(process.env.MONGODB_DB || 'marriage');
}

export default connectClient;
