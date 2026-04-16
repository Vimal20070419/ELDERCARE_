// services/ai.service.js — Adherence patterns, Risk scoring, and NL insight generation
const AdherenceLog = require('../modules/adherence/model');
const InteractionFlag = require('../modules/interactions/model');
const Medication = require('../modules/medication/model');
const adherenceService = require('../modules/adherence/service');
const logger = require('../utils/logger');

class AIService {
  /**
   * Generates a comprehensive AI summary for a patient.
   */
  async getPatientInsights(patientId, patientData) {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const [weeklyStats, interactions, patterns, logs] = await Promise.all([
        adherenceService.getWeeklyStats(patientId),
        InteractionFlag.find({ patientId, acknowledged: false }),
        adherenceService.detectMissedPatterns(patientId),
        AdherenceLog.find({ patientId, scheduledAt: { $gte: weekAgo } })
      ]);

      const overallRate = this._calculateOverallRate(weeklyStats);
      const riskScore = this._calculateRiskScore(overallRate, interactions, patientData);
      
      return {
        healthRiskScore: riskScore,
        riskLevel: this._getRiskLevel(riskScore),
        behavioralInsights: this._generateBehavioralInsights(logs, patterns, overallRate),
        safetyIntelligence: this._generateSafetyWarnings(interactions),
        priorityRank: riskScore // Use for sorting in caregiver dashboard
      };
    } catch (err) {
      logger.error(`AI Insight Engine Error: ${err.message}`);
      return null;
    }
  }

  _calculateOverallRate(stats) {
    const total = stats.reduce((s, m) => s + m.total, 0);
    const taken = stats.reduce((s, m) => s + m.taken, 0);
    return total > 0 ? Math.round((taken / total) * 100) : 100;
  }

  _calculateRiskScore(rate, interactions, patient) {
    let score = 0;
    
    // 1. Adherence Deficit (max 40 pts)
    score += (100 - rate) * 0.4;
    
    // 2. Interaction Hazard (max 30 pts)
    const severe = interactions.filter(i => i.severity === 'critical').length;
    score += Math.min((interactions.length * 5) + (severe * 15), 30);
    
    // 3. Demographic/Clinical Factors (max 30 pts)
    if (patient.age > 75) score += 10;
    if (patient.age > 85) score += 5;
    if (patient.comorbidities?.length > 0) {
      score += Math.min(patient.comorbidities.length * 5, 15);
    }

    return Math.min(Math.round(score), 100);
  }

  _getRiskLevel(score) {
    if (score >= 60) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  _generateBehavioralInsights(logs, patterns, rate) {
    const insights = [];
    
    // Adherence overview
    if (rate < 80) insights.push(`Overall adherence is at ${rate}%, which is below clinical target.`);
    
    // Temporal (Time of Day) analysis
    const nightLogs = logs.filter(l => {
      const hour = new Date(l.scheduledAt).getHours();
      return hour >= 20 || hour < 6; // 8 PM to 6 AM
    });
    const missedNights = nightLogs.filter(l => l.status === 'missed').length;
    if (nightLogs.length > 3 && (missedNights / nightLogs.length) > 0.3) {
      insights.push('Significant pattern of missing late-night doses detected.');
    }

    // Weekend analysis
    const weekendLogs = logs.filter(l => {
      const day = new Date(l.scheduledAt).getDay();
      return day === 0 || day === 6;
    });
    const missedWeekends = weekendLogs.filter(l => l.status === 'missed').length;
    if (weekendLogs.length > 2 && (missedWeekends / weekendLogs.length) > 0.4) {
      insights.push('Adherence consistency drops significantly during weekends.');
    }

    // Pattern matching
    if (patterns.length > 0) {
      const medNames = patterns.map(p => p.name).join(', ');
      insights.push(`Recurring missed dose patterns identified for: ${medNames}.`);
    }

    if (insights.length === 0 && rate >= 95) {
      insights.push('Patient demonstrates excellent adherence consistency across all doses.');
    }

    return insights;
  }

  _generateSafetyWarnings(interactions) {
    if (interactions.length === 0) return [];
    
    const summaries = interactions.map(i => {
      const drugs = `${i.drug1} + ${i.drug2}`;
      return `${i.severity.toUpperCase()}: Potential interaction between ${drugs}. ${i.description || 'Review clinical notes.'}`;
    });

    return summaries;
  }
}

module.exports = new AIService();
