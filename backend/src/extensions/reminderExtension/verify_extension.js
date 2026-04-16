// extensions/reminderExtension/verify_extension.js
/**
 * Verification script for the Reminder Extension.
 * This script manually triggers the initialization and simulates a reminder send.
 */
const { initExtension } = require('./index');
const smsService = require('../../services/sms.service');
const connectDB = require('../../config/db');
const mongoose = require('mongoose');

const runTest = async () => {
  try {
    console.log('--- Starting Extension Verification ---');
    
    // Connect to DB for model operations
    await connectDB();

    // 1. Initialize the extension
    initExtension();

    // 2. Hook Verification
    console.log('\nTesting SMS Hook...');
    // We simulate a patient and medication entry for tracking to succeed
    const Patient = require('../../modules/patient/model');
    const Medication = require('../../modules/medication/model');
    
    const testPatient = await Patient.findOne() || { name: 'Test User', phone: '1234567890', _id: new mongoose.Types.ObjectId() };
    const testMed = await Medication.findOne({ patientId: testPatient._id }) || { name: 'TestMed', dosage: '10mg', _id: new mongoose.Types.ObjectId() };

    console.log(`Using Patient: ${testPatient.name} (${testPatient.phone})`);
    
    // Trigger the enhanced reminder
    await smsService.sendReminder(testPatient.phone, testPatient.name, testMed.name, testMed.dosage, '10:00 AM');

    console.log('\nCheck sms_outbox.log to verify the "Reply 1/2" text was appended.');
    
    // 3. Tracking Verification
    const { ReminderTracking } = require('./models');
    const trackingCount = await ReminderTracking.countDocuments();
    console.log(`Current tracking documents in DB: ${trackingCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
};

runTest();
