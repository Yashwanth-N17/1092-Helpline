require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8000,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8001/api/v1',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
