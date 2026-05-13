const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");

class GeminiService {
  constructor() {
    this.genAI = config.GEMINI_API_KEY ? new GoogleGenerativeAI(config.GEMINI_API_KEY) : null;
  }

  async generateReply(context, userMessage) {
    if (!this.genAI) {
      return `[MOCK REPLY] I have noted your issue regarding: ${userMessage}. Our team is looking into it.`;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: config.GEMINI_MODEL });
      const prompt = `Context: ${context}\nUser: ${userMessage}\nResponse:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Failed to generate AI reply");
    }
  }
}

module.exports = new GeminiService();
