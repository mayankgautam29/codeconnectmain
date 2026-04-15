import mongoose from "mongoose";

type MongooseCache = {
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseConnection?: MongooseCache;
};

function getCache(): MongooseCache {
  if (!globalForMongoose.__mongooseConnection) {
    globalForMongoose.__mongooseConnection = { promise: null };
  }
  return globalForMongoose.__mongooseConnection;
}


export async function connect(): Promise<void> {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Add it to .env.local (MongoDB Atlas or local URI)."
    );
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  const cached = getCache();

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}
