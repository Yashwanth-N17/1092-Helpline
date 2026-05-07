const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

class AIBridgeService {
  static async analyzeText(text, callId) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
        text,
        call_id: callId,
      });
      return response.data;
    } catch (error) {
      console.error("AI Bridge Analysis Error:", error.message);
      return null;
    }
  }

  static async getSTT(audioBuffer) {
    // Implementation for streaming or batch STT
  }

  static async getTTS(text) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/tts`, { text }, { responseType: 'arraybuffer' });
      return response.data;
    } catch (error) {
      console.error("AI Bridge TTS Error:", error.message);
      return null;
    }
  }
}

module.exports = AIBridgeService;
