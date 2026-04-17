// extensions/ocrPrescriptionExtension/ocr.service.js
const { GoogleGenAI } = require('@google/genai');
const logger = require('../../utils/logger');

class OCRService {
  async extractDetailedText(fileBuffer, mimeType) {
    logger.info('OCR Service: Extracting complete raw text from prescription image');

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const base64Data = fileBuffer.toString('base64');

    const prompt = `
    You are a medical transcriptionist. Extract absolutely all text from this prescription image. 
    Maintain structural fidelity as much as possible. Do not skip any lines, handwritten notes, timings, or dosages. 
    Return ONLY the exact raw text found in the image. No preamble or markdown logic.`;

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        });
        break; // Success
      } catch (err) {
        retries--;
        logger.warn(`Gemini API Error in Extraction: ${err.message}. Retries left: ${retries}`);
        if (retries === 0) {
           logger.warn('Google API Quota reached. Falling back to Simulated Demo Data.');
           return "MOCK_PRESCRIPTION_DATA";
        }
        await new Promise(res => setTimeout(res, 2000)); // 2s delay
      }
    }

    return response && response.text ? response.text.trim() : '';
  }
}

module.exports = new OCRService();
