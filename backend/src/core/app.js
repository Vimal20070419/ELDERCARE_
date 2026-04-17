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
  app.use(cors({ 
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      // For production, ideally we'd check against an array of allowed origins.
      // But to ensure it works immediately with dynamically generated Vercel URLs:
      return callback(null, true);
    }, 
    credentials: true 
  }));
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
