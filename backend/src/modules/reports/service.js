// modules/reports/service.js — Weekly physician report generator
const AdherenceLog = require('../adherence/model');
const Medication = require('../medication/model');
const Patient = require('../patient/model');
const InteractionFlag = require('../interactions/model');
const adherenceService = require('../adherence/service');

class ReportService {
  async generateWeeklyReport(patientId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const patient = await Patient.findById(patientId).populate('userId', 'name email');
    if (!patient) throw Object.assign(new Error('Patient not found'), { statusCode: 404 });

    const meds = await Medication.find({ patientId });
    const weeklyStats = await adherenceService.getWeeklyStats(patientId);
    const missedPatterns = await adherenceService.detectMissedPatterns(patientId);

    const interactionFlags = await InteractionFlag.find({ patientId, acknowledged: false });

    // Overall adherence rate
    const totalDoses = weeklyStats.reduce((s, m) => s + m.total, 0);
    const totalTaken = weeklyStats.reduce((s, m) => s + m.taken, 0);
    const overallRate = totalDoses > 0 ? Math.round((totalTaken / totalDoses) * 100) : 0;

    // Daily breakdown (last 7 days)
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = await AdherenceLog.find({
        patientId,
        scheduledAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayTaken = dayLogs.filter((l) => l.status === 'taken').length;
      const dayTotal = dayLogs.length;

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        taken: dayTaken,
        total: dayTotal,
        rate: dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0,
      });
    }

    return {
      generatedAt: now.toISOString(),
      reportPeriod: { from: weekAgo.toISOString(), to: now.toISOString() },
      patient: {
        id: patient._id,
        name: patient.userId?.name,
        age: patient.age,
        comorbidities: patient.comorbidities,
        allergies: patient.allergies,
      },
      medications: meds.map((m) => ({
        id: m._id,
        name: m.name,
        brandName: m.brandName,
        dosage: m.dosage,
        frequency: m.frequency,
        times: m.times,
        status: m.status,
      })),
      weeklyAdherence: weeklyStats,
      overallAdherenceRate: overallRate,
      dailyBreakdown,
      missedDosePatterns: missedPatterns,
      drugInteractionFlags: interactionFlags.map((f) => ({
        drug1: f.drug1,
        drug2: f.drug2,
        severity: f.severity,
        description: f.description,
        detectedAt: f.createdAt,
      })),
      summaryNarrative: this._buildNarrative(patient, overallRate, missedPatterns, interactionFlags, weeklyStats),
    };
  }

  _buildNarrative(patient, overallRate, patterns, interactions, weeklyStats) {
    const name = patient.userId?.name || 'Patient';
    const lines = [];

    lines.push(`Patient ${name} (age ${patient.age || 'N/A'}) achieved an overall medication adherence rate of ${overallRate}% during the reporting period.`);

    if (overallRate >= 80) {
      lines.push('Adherence is satisfactory. Continue current regimen.');
    } else if (overallRate >= 60) {
      lines.push('Adherence is below recommended threshold. Caregiver follow-up recommended.');
    } else {
      lines.push('CRITICAL: Adherence is dangerously low. Immediate physician review required.');
    }

    if (patterns.length > 0) {
      const medNames = patterns.map((p) => p.name).join(', ');
      lines.push(`Missed dose patterns detected for: ${medNames}. Review patient barriers to adherence.`);
    }

    if (interactions.length > 0) {
      const critical = interactions.filter((f) => f.severity === 'critical');
      lines.push(`${interactions.length} drug interaction flag(s) detected.${critical.length > 0 ? ` ${critical.length} are CRITICAL and require immediate attention.` : ''}`);
    }

    const lowestMed = weeklyStats.sort((a, b) => a.rate - b.rate)[0];
    if (lowestMed && lowestMed.rate < 70) {
      lines.push(`Lowest adherence medication: ${lowestMed.name} (${lowestMed.rate}%). Consider patient counselling.`);
    }

    return lines.join(' ');
  }
}

module.exports = new ReportService();
