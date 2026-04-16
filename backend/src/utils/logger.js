// utils/logger.js — Lightweight console logger with levels and timestamps
const levels = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', debug: '\x1b[90m' };
const reset = '\x1b[0m';

const log = (level, msg) => {
  const ts = new Date().toISOString();
  console.log(`${levels[level] || ''}[${ts}] [${level.toUpperCase()}] ${msg}${reset}`);
};

module.exports = {
  info: (msg) => log('info', msg),
  warn: (msg) => log('warn', msg),
  error: (msg) => log('error', msg),
  debug: (msg) => log('debug', msg),
};
