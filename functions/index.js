const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connectDB, closeConnection } = require('./database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const vocabulariesRoutes = require('./routes/vocabularies');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const startServer = async () => {
  await connectDB();

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/vocabularies', vocabulariesRoutes);

  app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });
};

startServer();
