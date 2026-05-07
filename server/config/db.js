const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("FATAL ERROR: No MongoDB URI provided in environment variables!");
    console.log("Expected: MONGO_URI or MONGODB_URI");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Modern mongoose doesn't need these options but kept for clarity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
