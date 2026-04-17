// modules/physicianReport/physicianReport.service.js
const adherenceService = require('../adherence/service');
const medicationService = require('../medication/service');
const aiService = require('../../services/ai.service');
const openFDAService = require('../../services/openfda.service');
const Patient = require('../patient/model');
const logger = require('../../utils/logger');

class PhysicianReportService {
  /**
   * Generates a physician report with a completeness score.
   */
  async generateReport(patientId) {
    try {
      const patient = await Patient.findById(patientId).populate('userId', 'name');
      if (!patient) throw new Error('Patient not found');

      const [meds, adherenceStats, patterns, aiData] = await Promise.all([
        medicationService.getPatientMedications(patientId),
        adherenceService.getWeeklyStats(patientId),
        adherenceService.detectMissedPatterns(patientId),
        aiService.getPatientInsights(patientId, patient)
      ]);

      const completeness = this._computeCompletenessScore(meds, adherenceStats, aiData);

      return {
        patientId,
        patientName: patient.userId?.name,
        completenessScore: completeness.score,
        missingFields: completeness.missingFields,
        summary: {
          activeMedications: meds.filter(m => m.status === 'active').length,
          overallAdherence: this._calculateOverallAdherence(adherenceStats),
          riskLevel: aiData?.riskLevel || 'Unknown',
          riskScore: aiData?.healthRiskScore,
          criticalInteractions: aiData?.safetyIntelligence?.length || 0,
          detectedPatterns: patterns.length
        },
        aiInsights: aiData?.behavioralInsights || []
      };
    } catch (err) {
      logger.error(`Physician Report generation failed: ${err.message}`);
      throw err;
    }
  }

  _computeCompletenessScore(meds, stats, ai) {
    let score = 0;
    const missingFields = [];

    // 1. Medication Schedule (20%)
    if (meds && meds.length > 0) score += 20;
    else missingFields.push('Medication schedule');

    // 2. Adherence Logs availability (20%)
    const hasLogs = stats.some(s => s.total > 0);
    if (hasLogs) score += 20;
    else missingFields.push('Adherence logs');

    // 3. Adherence Percentages (20%)
    const rate = this._calculateOverallAdherence(stats);
    if (rate !== null) score += 20;
    else missingFields.push('Adherence rate data');

    // 4. Clinical Risk Score availability (20%)
    if (ai && ai.healthRiskScore !== undefined && ai.healthRiskScore !== null) score += 20;
    else missingFields.push('Health risk score');

    // 5. Drug Safety / AI Safety Intelligence (20%)
    if (ai && ai.safetyIntelligence && Array.isArray(ai.safetyIntelligence)) score += 20;
    else missingFields.push('Drug safety analysis');

    return { score, missingFields };
  }

  _calculateOverallAdherence(stats) {
    const total = stats.reduce((acc, curr) => acc + curr.total, 0);
    const taken = stats.reduce((acc, curr) => acc + curr.taken, 0);
    return total > 0 ? Math.round((taken / total) * 100) : null;
  }
}

module.exports = new PhysicianReportService();
