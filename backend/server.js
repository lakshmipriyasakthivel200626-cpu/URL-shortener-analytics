const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const { redirectUrl } = require('./controllers/urlController');

// Load env configurations
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Endpoint Handlers
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Public Redirect Route
app.get('/:code', redirectUrl);

// Base Route Health check
app.get('/', (req, res) => {
  res.json({ message: 'URL Shortener with Analytics API is running...' });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'API Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
