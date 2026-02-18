const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    // Dev fallback: in-memory database (data lost on restart)
    console.log('No MONGODB_URI found, starting in-memory database...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected (data will NOT persist)`);
    return;
  }

  // Production: MongoDB Atlas (data stored permanently)
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Atlas Connected: ${conn.connection.host} (data stored permanently)`);
};

module.exports = connectDB;
