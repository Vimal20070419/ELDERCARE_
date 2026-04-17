// modules/adherence/service.js — Adherence tracking, pattern detection, weekly stats
const AdherenceLog = require('./model');
const Medication = require('../medication/model');
const notificationService = require('../../services/notification.service');
const logger = require('../../utils/logger');

class AdherenceService {
  async logCheckIn(patientId, medicationId, status, notes = '') {
    const log = await AdherenceLog.create({
      patientId,
      medicationId,
      scheduledAt: new Date(),
      respondedAt: new Date(),
      status,
      method: 'web',
      notes,
    });

    if (status === 'skipped') {
      await notificationService.create(
        patientId,
        medicationId,
        `Medication dose skipped by patient.`,
        'alert',
        'medium'
      );
    }

    return log;
  }

  /**
   * Compute adherence rate for a patient over the last 7 days per medication.
   * Returns: [{ medicationId, name, taken, scheduled, rate }]
   */
  async getWeeklyStats(patientId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await AdherenceLog.find({
      patientId,
      scheduledAt: { $gte: weekAgo },
    }).populate('medicationId', 'name dosage frequency');

    const grouped = {};
    for (const log of logs) {
      const id = log.medicationId?._id?.toString() || log.medicationId.toString();
      if (!grouped[id]) {
        grouped[id] = {
          medicationId: id,
          name: log.medicationId?.name || 'Unknown',
          dosage: log.medicationId?.dosage || '',
          taken: 0,
          skipped: 0,
          missed: 0,
          total: 0,
        };
      }
      grouped[id].total++;
      grouped[id][log.status]++;
    }

    return Object.values(grouped).map((item) => ({
      ...item,
      rate: item.total > 0 ? Math.round((item.taken / item.total) * 100) : 0,
    }));
  }

  /**
   * Detect missed dose patterns: 3+ consecutive misses or weekly rate < 60%
   */
  async detectMissedPatterns(patientId) {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const logs = await AdherenceLog.find({
      patientId,
      scheduledAt: { $gte: twoWeeksAgo }
    }).sort({ scheduledAt: 1 });

    const meds = await Medication.find({ patientId, status: 'active' });
    const patterns = [];

    for (const med of meds) {
      const medLogs = logs.filter(l => l.medicationId.toString() === med._id.toString());
      if (medLogs.length < 5) continue;

      const missed = medLogs.filter(l => l.status === 'missed' || l.status === 'skipped');
      const rate = Math.round(((medLogs.length - missed.length) / medLogs.length) * 100);

      // 1. Threshold detection
      let severity = 'low';
      if (rate < 60) severity = 'high';
      else if (rate < 80) severity = 'medium';

      // 2. Consecutive misses
      let consecutive = 0;
      let maxConsecutive = 0;
      for (const log of medLogs) {
        if (log.status === 'missed' || log.status === 'skipped') consecutive++;
        else {
          maxConsecutive = Math.max(maxConsecutive, consecutive);
          consecutive = 0;
        }
      }
      maxConsecutive = Math.max(maxConsecutive, consecutive);
      if (maxConsecutive >= 3) severity = 'high';

      // 3. Temporal (Time-of-day) deficit detection
      const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      const hourMisses = { morning: 0, afternoon: 0, evening: 0, night: 0 };

      medLogs.forEach(l => {
        const hour = new Date(l.scheduledAt).getHours();
        let slot = 'night';
        if (hour >= 6 && hour < 12) slot = 'morning';
        else if (hour >= 12 && hour < 17) slot = 'afternoon';
        else if (hour >= 17 && hour < 21) slot = 'evening';
        
        hourCounts[slot]++;
        if (l.status === 'missed' || l.status === 'skipped') hourMisses[slot]++;
      });

      const temporalPatterns = [];
      Object.keys(hourCounts).forEach(slot => {
        if (hourCounts[slot] >= 3 && (hourMisses[slot] / hourCounts[slot]) > 0.5) {
          temporalPatterns.push(`${slot} deficit`);
        }
      });

      if (severity !== 'low' || temporalPatterns.length > 0) {
        patterns.push({
          medicationId: med._id,
          name: med.name,
          twoWeekRate: rate,
          consecutiveMisses: maxConsecutive,
          temporalPatterns,
          severity
        });
      }
    }

    return patterns;
  }

  /**
   * Mark all un-responded scheduled doses from yesterday as missed.
   * Called by the nightly cron job.
   */
  async markMissedDoses() {
    const meds = await Medication.find({ status: 'active' });
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let marked = 0;

    for (const med of meds) {
      for (const doseTime of med.times || []) {
        const [h, m] = doseTime.split(':').map(Number);
        const scheduled = new Date(yesterday);
        scheduled.setHours(h, m, 0, 0);

        // Check if already logged
        const existing = await AdherenceLog.findOne({
          medicationId: med._id,
          scheduledAt: { $gte: new Date(scheduled - 600_000), $lte: new Date(scheduled.getTime() + 600_000) },
        });

        if (!existing) {
          await AdherenceLog.create({
            patientId: med.patientId,
            medicationId: med._id,
            scheduledAt: scheduled,
            status: 'missed',
            method: 'auto',
          });
          await notificationService.create(
            med.patientId,
            med._id,
            `Missed dose: ${med.name} ${med.dosage} at ${doseTime}`,
            'missed_dose',
            'high'
          );
          marked++;
        }
      }
    }

    logger.info(`Marked ${marked} missed doses from yesterday.`);
    
    // Proactively check for patterns after marking missed doses
    await this.checkAndNotifyPatterns();
    
    return marked;
  }

  /**
   * Scan all active patients for dangerous adherence patterns and alert caregivers.
   */
  async checkAndNotifyPatterns() {
    const patients = await Medication.distinct('patientId', { status: 'active' });
    for (const patientId of patients) {
      const patterns = await this.detectMissedPatterns(patientId);
      const critical = patterns.filter(p => p.severity === 'high');
      
      if (critical.length > 0) {
        const medNames = critical.map(p => p.name).join(', ');
        await notificationService.create(
          patientId,
          null, // Global patient alert
          `🚨 CRITICAL ADHERENCE PATTERN: Multiple doses missed for ${medNames}. Please check on the patient.`,
          'pattern_alert',
          'high'
        );
        logger.warn(`Proactive pattern alert triggered for patient ${patientId}`);
      }
    }
  }

  async getRecentLogs(patientId, limit = 50) {
    return await AdherenceLog.find({ patientId })
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .populate('medicationId', 'name dosage');
  }
}

module.exports = new AdherenceService();
