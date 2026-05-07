const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

class AIBridgeService {
  /**
   * Send a raw audio chunk to the AI service and get back a full analysis result
   * including transcript, emotion, urgency, TTS audio etc.
   */
  static async processAudioChunk(callId, audioBuffer) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/process-audio`,
        {
          call_id: callId,
          audio_base64: audioBuffer.toString("base64"),
        },
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error("[AIBridge] processAudioChunk error:", error.message);
      return null;
    }
  }

  /**
   * Send a plain text transcript to get analysis (emotion, urgency, intent etc.)
   */
  static async analyzeText(text, callId) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
        text,
        call_id: callId,
      });
      return response.data;
    } catch (error) {
      console.error("[AIBridge] analyzeText error:", error.message);
      return null;
    }
  }

  /**
   * Generate TTS audio from text
   */
  static async getTTS(text) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/tts`,
        { text },
        { responseType: "arraybuffer" }
      );
      return Buffer.from(response.data).toString("base64");
    } catch (error) {
      console.error("[AIBridge] getTTS error:", error.message);
      return null;
    }
  }
}

module.exports = AIBridgeService;
