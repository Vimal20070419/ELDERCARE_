// extensions/ocrPrescriptionExtension/validation.service.js
const logger = require('../../utils/logger');

class ValidationService {
  validateMedicines(parsedData) {
    logger.info('Validation Service: Verifying structured medicines pipeline');

    if (!Array.isArray(parsedData)) {
      throw new Error('Parsed data format must be an array.');
    }

    const validMedicines = [];

    for (const med of parsedData) {
      if (!med || typeof med !== 'object') continue;
      
      // Strict filter rule
      if (!med.name || typeof med.name !== 'string' || med.name.trim() === '') {
        logger.warn('Dropped medication entry: Missing Name field');
        continue;
      }

      // Defaulting rules safely
      const structuredEntry = {
        name: med.name.trim(),
        dosage: med.dosage && typeof med.dosage === 'string' ? med.dosage.trim() : 'Unknown dosage',
        frequency: this._mapFrequency(med.frequency),
        instructions: med.instructions ? med.instructions.trim() : '',
        times: ['08:00'] // Default morning time required by schema
      };

      validMedicines.push(structuredEntry);
    }

    if (validMedicines.length === 0) {
      throw new Error('No valid medications found after noise filtering.');
    }

    return validMedicines;
  }

  _mapFrequency(rawFreq) {
    const validSet = ['Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Every 6 hours', 'Weekly', 'As needed'];
    if (!rawFreq) return 'Once daily';
    const match = validSet.find(f => f.toLowerCase() === rawFreq.toLowerCase());
    return match || 'Once daily';
  }
}

module.exports = new ValidationService();
