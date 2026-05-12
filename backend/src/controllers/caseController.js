const aiServiceClient = require('../services/aiServiceClient');

exports.analyzeCase = async (req, res) => {
  try {
    const { text } = req.body;
    const analysis = await aiServiceClient.analyzeText(text);
    const severity = await aiServiceClient.getSeverity(text);
    res.json({ ...analysis, severity });
  } catch (error) {
    res.status(500).json({ error: `AI Service Error: ${error.message}` });
  }
};

exports.summarizeCase = async (req, res) => {
  try {
    const { transcript } = req.body;
    const summary = await aiServiceClient.getSummary(transcript);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: `AI Service Error: ${error.message}` });
  }
};
