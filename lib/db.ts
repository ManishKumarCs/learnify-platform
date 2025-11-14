// Database connection and models will be configured here
// Using MongoDB with Mongoose for schema management

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.warn('[db] MONGODB_URI is not set. Set it in your .env.local to enable database.')
}

let cached = (global as any)._mongoose
if (!cached) {
  cached = (global as any)._mongoose = { conn: null as mongoose.Connection | null, promise: null as Promise<mongoose.Connection> | null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined')
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined })
      .then((m: typeof mongoose) => m.connection)
  }
  cached.conn = await cached.promise
  return cached.conn
}
