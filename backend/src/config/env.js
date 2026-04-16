// config/env.js — Load and validate environment variables
const dotenv = require('dotenv');
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[ENV] Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OPENFDA_BASE_URL: process.env.OPENFDA_BASE_URL || 'https://api.fda.gov/drug',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SMS_ENABLED: process.env.SMS_ENABLED === 'true',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'simulated',
  OPENFDA_CACHE_TTL: parseInt(process.env.OPENFDA_CACHE_TTL) || 3600000,
};
