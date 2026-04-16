const env = require('../config/env');
const openFDAAdapter = require('../adapters/openfda.adapter');
const logger = require('../utils/logger');

const cache = new Map();
const CACHE_TTL = env.OPENFDA_CACHE_TTL;

class OpenFDAService {
  async getDrugInteractions(drugName) {
    const key = `interactions:${drugName.toLowerCase().trim()}`;
    if (cache.has(key)) {
      const { data, ts } = cache.get(key);
      if (Date.now() - ts < CACHE_TTL) {
        logger.debug(`Cache hit: ${key}`);
        return data;
      }
      cache.delete(key);
    }
    const data = await openFDAAdapter.getDrugInteractions(drugName);
    cache.set(key, { data, ts: Date.now() });
    return data;
  }

  async getWarnings(drugName) {
    const key = `warnings:${drugName.toLowerCase().trim()}`;
    if (cache.has(key)) {
      const { data, ts } = cache.get(key);
      if (Date.now() - ts < CACHE_TTL) return data;
      cache.delete(key);
    }
    const data = await openFDAAdapter.getWarnings(drugName);
    cache.set(key, { data, ts: Date.now() });
    return data;
  }

  async getSideEffects(drugName) {
    const key = `sides:${drugName.toLowerCase().trim()}`;
    if (cache.has(key)) {
      const { data, ts } = cache.get(key);
      if (Date.now() - ts < CACHE_TTL) return data;
      cache.delete(key);
    }
    const data = await openFDAAdapter.getSideEffects(drugName);
    cache.set(key, { data, ts: Date.now() });
    return data;
  }
}

module.exports = new OpenFDAService();
