const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connectDB, closeConnection } = require('./database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const usersRoutes = require('./routes/userRoutes');
const genkitRoute = require('./routes/genkitVocabulary');
const vocabulariesRoutes = require('./routes/vocabularies');
const functions = require("firebase-functions");

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  // Allow only specific origin foraaproduction, otherwise allow all
  // origin: 'https://tu-vung-447ad.web.app',
  origin:  'http://127.0.0.1:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Headers'],
  credentials: true,
}));

// Connect to the database
connectDB();

// Route handling
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vocabularies', vocabulariesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vocabylary', genkitRoute); 

// Error handling middleware (add this before exporting the app)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

exports.tuVungFunction = functions.https.onRequest(app);
