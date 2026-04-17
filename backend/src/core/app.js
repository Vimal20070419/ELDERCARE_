// core/app.js — Express application factory
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const loadModules = require('./moduleLoader');
const errorHandler = require('../middleware/error.middleware');

const createApp = () => {
  const app = express();

  // Security & logging
  app.use(helmet());
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Load all module routes
  loadModules(app);

  // Load Immutable Extensions
  require('../bootstrapExtensions')(app);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
