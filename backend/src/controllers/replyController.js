const geminiService = require('../services/geminiService');

exports.generateReply = async (req, res) => {
  try {
    const { context, user_message } = req.body;
    const reply = await geminiService.generateReply(context, user_message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
