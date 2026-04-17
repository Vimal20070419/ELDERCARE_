// extensions/ocrPrescriptionExtension/medicationInjector.service.js
const medicationService = require('../../modules/medication/service');
const logger = require('../../utils/logger');

class MedicationInjectorService {
  /**
   * Automatically iterates valid OCR structures and injects them
   * directly into the system using the existing modular dependency.
   */
  async injectAll(patientId, caregiverId, validMedicines) {
    logger.info(`Injector Service: Commencing injection of ${validMedicines.length} medications for patient ${patientId}`);
    
    if (!patientId || !caregiverId) {
      throw new Error('Missing patientId or caregiverId for auto-injection mapping.');
    }

    const insertedMedications = [];

    // Process sequentially or via Promise.all to respect core service rules.
    // Sequential allows interactions checks to run accurately against previously inserted ones if relying on DB state.
    for (const data of validMedicines) {
      try {
        const payload = { ...data, patientId };
        const result = await medicationService.add(payload, caregiverId);
        insertedMedications.push(result);
        logger.info(`Injected medication: ${result.name}`);
      } catch (err) {
        logger.error(`Failed to inject medication ${data.name}: ${err.message}`);
        // Push the error reference so the caregiver knows it failed
        insertedMedications.push({ name: data.name, error: err.message, status: 'failed_injection' });
      }
    }

    return insertedMedications;
  }
}

module.exports = new MedicationInjectorService();
