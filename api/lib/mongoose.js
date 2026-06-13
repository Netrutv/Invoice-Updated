const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let cached = global._mongooseCache;
if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not set in environment variables');
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
        }).then(m => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectDB;
