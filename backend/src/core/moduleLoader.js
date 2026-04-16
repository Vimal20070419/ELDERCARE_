// core/moduleLoader.js — Auto-registers all module routers
const authRoutes = require('../modules/auth/routes');
const patientRoutes = require('../modules/patient/routes');
const medicationRoutes = require('../modules/medication/routes');
const adherenceRoutes = require('../modules/adherence/routes');
const interactionRoutes = require('../modules/interactions/routes');
const reminderRoutes = require('../modules/reminders/routes');
const reportRoutes = require('../modules/reports/routes');

const modules = [
  authRoutes,
  patientRoutes,
  medicationRoutes,
  adherenceRoutes,
  interactionRoutes,
  reminderRoutes,
  reportRoutes,
];

const loadModules = (app) => {
  for (const mod of modules) {
    app.use(mod.prefix, mod.router);
  }
};

module.exports = loadModules;
