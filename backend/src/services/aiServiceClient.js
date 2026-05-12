const axios = require('axios');
const config = require('../config');

class AIServiceClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.AI_SERVICE_URL
    });
  }

  async analyzeText(text) {
    const response = await this.client.post('/analysis/analyze', { text });
    return response.data;
  }

  async getSeverity(text) {
    const response = await this.client.post('/analysis/severity', { text });
    return response.data.severity;
  }

  async getSummary(transcript) {
    const response = await this.client.post('/summary/summarize', { transcript });
    return response.data.summary;
  }
}

module.exports = new AIServiceClient();
