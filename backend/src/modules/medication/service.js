// modules/medication/service.js — Prescription management + interaction scanning
const Medication = require('./model');
const Patient = require('../patient/model');
const InteractionFlag = require('../interactions/model');
const interactionService = require('../../services/interaction.service');
const notificationService = require('../../services/notification.service');
const schedulerService = require('../../services/scheduler.service');
const logger = require('../../utils/logger');

class MedicationService {
  async add(data, caregiverId) {
    const medication = await Medication.create({ ...data, addedBy: caregiverId });

    // Run interaction scan asynchronously (don't block response)
    this._runInteractionScan(medication).catch((err) =>
      logger.error(`Interaction scan failed: ${err.message}`)
    );

    // Schedule reminders
    schedulerService.scheduleForMedication(medication);

    return medication;
  }

  async _runInteractionScan(newMed) {
    const activeMeds = await Medication.find({
      patientId: newMed.patientId,
      status: 'active',
      _id: { $ne: newMed._id },
    });

    const allNames = [newMed.name, ...activeMeds.map((m) => m.name)];
    const flags = await interactionService.detectInteractions(allNames);

    for (const flag of flags) {
      // Persist flag
      const existing = await InteractionFlag.findOne({
        patientId: newMed.patientId,
        $or: [
          { drug1: flag.drug1, drug2: flag.drug2 },
          { drug1: flag.drug2, drug2: flag.drug1 },
        ],
      });

      if (!existing) {
        const savedFlag = await InteractionFlag.create({ patientId: newMed.patientId, ...flag });
        // Notify caregiver via in-app notification (linked to patient)
        await notificationService.create(
          newMed.patientId,
          newMed._id,
          `⚠️ Drug interaction detected: ${flag.drug1} ↔ ${flag.drug2}. ${flag.description.slice(0, 100)}...`,
          'interaction_flag',
          flag.severity
        );
        logger.warn(`Saved new interaction flag: ${flag.drug1} ↔ ${flag.drug2}`);
      }
    }
  }

  async getPatientMedications(patientId, status = null) {
    const query = { patientId };
    if (status) query.status = status;
    return await Medication.find(query).sort({ createdAt: -1 });
  }

  async getById(id) {
    const med = await Medication.findById(id);
    if (!med) throw Object.assign(new Error('Medication not found'), { statusCode: 404 });
    return med;
  }

  async updateStatus(id, status) {
    return await Medication.findByIdAndUpdate(id, { status }, { new: true });
  }

  async delete(id) {
    return await Medication.findByIdAndDelete(id);
  }
}

module.exports = new MedicationService();
