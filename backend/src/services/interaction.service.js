// services/interaction.service.js — Drug-drug interaction detection engine
const openFDAService = require('./openfda.service');
const logger = require('../utils/logger');

/**
 * Determines severity from interaction text.
 */
const parseSeverity = (text) => {
  const t = text.toLowerCase();
  if (t.includes('life-threatening') || t.includes('fatal') || t.includes('contraindicated')) return 'critical';
  if (t.includes('serious') || t.includes('major') || t.includes('severe')) return 'high';
  if (t.includes('moderate') || t.includes('caution')) return 'medium';
  return 'low';
};

class InteractionService {
  /**
   * Scan a list of medication names for pairwise interactions.
   * Returns array of { drug1, drug2, severity, description }
   */
  async detectInteractions(medicationNames) {
    const flags = [];

    for (let i = 0; i < medicationNames.length; i++) {
      const drugA = medicationNames[i];
      let interactions = [];
      try {
        interactions = await openFDAService.getDrugInteractions(drugA);
      } catch {
        logger.warn(`Could not fetch interactions for: ${drugA}`);
        continue;
      }

      for (let j = 0; j < medicationNames.length; j++) {
        if (i === j) continue;
        const drugB = medicationNames[j].toLowerCase();

        for (const interactionText of interactions) {
          if (interactionText.includes(drugB)) {
            // Avoid duplicate pairs
            const exists = flags.some(
              (f) =>
                (f.drug1.toLowerCase() === drugA.toLowerCase() && f.drug2.toLowerCase() === drugB) ||
                (f.drug1.toLowerCase() === drugB && f.drug2.toLowerCase() === drugA.toLowerCase())
            );
            if (!exists) {
              const snippet = interactionText.substring(0, 300);
              flags.push({
                drug1: drugA,
                drug2: medicationNames[j],
                severity: parseSeverity(interactionText),
                description: snippet,
              });
              logger.warn(`Interaction detected: ${drugA} ↔ ${medicationNames[j]} (${parseSeverity(interactionText)})`);
            }
            break;
          }
        }
      }
    }

    return flags;
  }
}

module.exports = new InteractionService();
