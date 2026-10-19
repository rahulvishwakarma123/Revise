import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dsa_revision_tracker';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB (${error.message}). App will operate gracefully or use fallback mode.`);
    return false;
  }
};
