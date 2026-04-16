// adapters/openfda.adapter.js — Low-level OpenFDA HTTP adapter
const axios = require('axios');
const { OPENFDA_BASE_URL } = require('../config/env');
const logger = require('../utils/logger');

class OpenFDAAdapter {
  /**
   * Fetch drug label data for a given drug name.
   * Returns first matching result or null.
   */
  async findDrugLabel(drugName) {
    try {
      const query = encodeURIComponent(`openfda.brand_name:"${drugName}" OR openfda.generic_name:"${drugName}"`);
      const url = `${OPENFDA_BASE_URL}/label.json?search=${query}&limit=1`;
      const response = await axios.get(url, { timeout: 8000 });
      return response.data?.results?.[0] || null;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        logger.warn(`OpenFDA: no label found for "${drugName}"`);
        return null;
      }
      logger.error(`OpenFDA label fetch error for "${drugName}": ${err.message}`);
      return null;
    }
  }

  /**
   * Fetch drug interaction text for a given drug name.
   * Returns array of interaction strings or empty array.
   */
  async getDrugInteractions(drugName) {
    const label = await this.findDrugLabel(drugName);
    if (!label) return [];
    const interactions = label.drug_interactions || [];
    // FDA returns interactions as array of strings
    return interactions.map((s) => s.toLowerCase());
  }

  /**
   * Fetch warnings for a given drug name.
   */
  async getWarnings(drugName) {
    const label = await this.findDrugLabel(drugName);
    if (!label) return [];
    return label.warnings || label.warnings_and_cautions || label.precautions || [];
  }

  /**
   * Fetch adverse reactions (side effects) for a given drug name.
   */
  async getSideEffects(drugName) {
    const label = await this.findDrugLabel(drugName);
    if (!label) return [];
    return label.adverse_reactions || [];
  }
}

module.exports = new OpenFDAAdapter();
