// database.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://baobaote00:M1kHL93T70udniIl@tu-vung.jeysuu1.mongodb.net/?retryWrites=true&w=majority&appName=tu-vung";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
};

const getCollection = (collectionName) => {
  return client.db("test").collection(collectionName);
};

const closeConnection = async () => {
  try {
    await client.close();
    console.log("Connection to MongoDB closed");
  } catch (error) {
    console.error(error);
  }
};

module.exports = { connectDB, getCollection, closeConnection };
