/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { connectDB, getCollection, closeConnection } = require('./database');

const app = express();
app.use(bodyParser.json());


const startServer = async () => {
  await connectDB();

  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    try {
      const usersCollection = getCollection('users');
      await usersCollection.insertOne(user);
      res.send({ message: 'User registered' });
    } catch (error) {
      res.status(500).send({ message: 'Error registering user', error });
    }
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const usersCollection = getCollection('users');
      const user = await usersCollection.findOne({ username });
      if (!user) {
        return res.status(400).send({ message: 'Invalid credentials' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, 'secret_key');
      res.send({ token });
    } catch (error) {
      res.status(500).send({ message: 'Error logging in', error });
    }
  });

  const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    try {
      const payload = jwt.verify(token, 'secret_key');
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
  };

  app.get('/protected', authMiddleware, (req, res) => {
    res.send({ message: 'This is protected data' });
  });

  app.listen(3001, () => {
    console.log(`Server is running on port 3001`);
  });
};

startServer();
