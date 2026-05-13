const telephonyService = require('../services/telephonyService');

const incomingCall = async (req, res) => {
  try {
    const callData = req.body;
    const result = await telephonyService.handleIncomingCall(callData);
    res.set('Content-Type', 'text/xml');
    res.send(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const callStatus = async (req, res) => {
  try {
    const statusData = req.body;
    await telephonyService.updateCallStatus(statusData);
    res.json({ success: true, message: 'Call status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const forwardAgent = async (req, res) => {
  try {
    const { callSid, severity } = req.body;
    const result = await telephonyService.forwardToAgent(callSid, severity);
    res.json({ success: true, message: 'Call forwarded to agent', data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const health = (req, res) => {
  res.json({ success: true, message: 'Telephony service is running' });
};

module.exports = { incomingCall, callStatus, forwardAgent, health };
