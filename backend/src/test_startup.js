const createApp = require('./core/app');
const connectDB = require('./config/db');
console.log('Testing App Instantiation');
try {
  const app = createApp();
  console.log('App instantiated successfully! No syntax or require errors.');
} catch (err) {
  console.error('Crash Details:', err);
}
