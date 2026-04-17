// verify_new_features.js
const express = require('express');
const bootstrapExtensions = require('./bootstrapExtensions');
const connectDB = require('./config/db');
const physicianReportService = require('./modules/physicianReport/physicianReport.service');
const checkinService = require('./modules/checkin/checkin.service');
const Patient = require('./modules/patient/model');
const Medication = require('./modules/medication/model');

const runVerification = async () => {
  try {
    console.log('--- Starting Feature Verification ---');
    await connectDB();
    const app = express();

    // 1. Test Bootstrapping
    bootstrapExtensions(app);
    console.log('✅ Bootstrap script executed successfully.');

    // 2. Test Physician Report Logic
    console.log('\nTesting Physician Report Logic...');
    const testPatient = await Patient.findOne();
    if (testPatient) {
      const report = await physicianReportService.generateReport(testPatient._id);
      console.log('Completeness Score:', report.completenessScore);
      console.log('Missing Fields:', report.missingFields);
    } else {
      console.log('⚠️ No patient found in DB to test report generation.');
    }

    // 3. Test Check-in Logic
    console.log('\nTesting Check-in Logic...');
    if (testPatient) {
      const testMed = await Medication.findOne({ patientId: testPatient._id });
      if (testMed) {
        const checkin = await checkinService.logCheckin(testPatient._id, testMed._id, 'taken');
        console.log('✅ Manual check-in log created:', checkin._id);
      }
    }

    console.log('\n--- Verification Complete ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
};

runVerification();
