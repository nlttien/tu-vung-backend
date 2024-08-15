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
const functions = require('firebase-functions');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', "https://tu-vung-447ad.web.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vocabularies', vocabulariesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vocabylary', genkitRoute);

exports.beServerFunction = functions.https.onRequest(app);

