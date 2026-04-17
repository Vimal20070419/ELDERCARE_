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
    
    // 1. Adherence Deficit (max 50 pts)
    // Steep penalty for falling below 80%
    if (rate < 80) {
      score += (80 - rate) * 1.5;
      score += 20; // Base penalty for low adherence
    } else {
      score += (100 - rate) * 1.0;
    }
    
    // 2. Interaction Hazard (max 30 pts)
    const critical = interactions.filter(i => i.severity === 'critical').length;
    const high = interactions.filter(i => i.severity === 'high').length;
    score += Math.min((critical * 20) + (high * 10), 30);
    
    // 3. Clinical Fragility (max 20 pts)
    if (patient.age > 80) score += 10;
    if (patient.comorbidities?.length >= 3) score += 10;
    else if (patient.comorbidities?.length > 0) score += 5;

    return Math.min(Math.round(score), 100);
  }

  _getRiskLevel(score) {
    if (score >= 60) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  _generateBehavioralInsights(logs, patterns, rate) {
    const insights = [];
    
    // 1. Overall Adherence Context
    if (rate < 80) {
      insights.push(`Patient adherence is currently at ${rate}%, which is significantly below the clinical target of 90%.`);
    } else if (rate < 95) {
      insights.push(`Adherence is generally good (${rate}%), but small inconsistencies are persisting.`);
    }
    
    // 2. Temporal/Pattern Specific Insights
    if (patterns.length > 0) {
      patterns.forEach(p => {
        if (p.temporalPatterns?.length > 0) {
          const times = p.temporalPatterns.join(' and ');
          insights.push(`Detected a recurring ${times} for ${p.name}. Consider setting extra reminders for these time slots.`);
        }
        if (p.consecutiveMisses >= 3) {
          insights.push(`Critical: Patient has missed ${p.consecutiveMisses} consecutive doses of ${p.name}. Immediate caregiver intervention recommended.`);
        }
      });
    }

    // 3. Time-of-Day Analysis (Aggregated)
    const nightLogs = logs.filter(l => {
      const hour = new Date(l.scheduledAt).getHours();
      return hour >= 20 || hour < 6; 
    });
    const missedNights = nightLogs.filter(l => l.status === 'missed' || l.status === 'skipped').length;
    if (nightLogs.length >= 3 && (missedNights / nightLogs.length) > 0.4) {
      insights.push('Significant difficulty detected with late-night medication compliance.');
    }

    // 4. Weekend vs Weekday analysis
    const weekendLogs = logs.filter(l => {
      const day = new Date(l.scheduledAt).getDay();
      return day === 0 || day === 6;
    });
    const missedWeekends = weekendLogs.filter(l => l.status === 'missed' || l.status === 'skipped').length;
    if (weekendLogs.length >= 4 && (missedWeekends / weekendLogs.length) > 0.5) {
      insights.push('Routine disruption observed during weekends, leading to higher rates of missed doses.');
    }

    if (insights.length === 0 && rate >= 98) {
      insights.push('Outstanding adherence performance. Patient maintains a near-perfect medication routine.');
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
