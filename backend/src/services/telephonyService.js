const axios = require('axios');
const config = require('../config');

const AI_SERVICE_URL = config.AI_SERVICE_URL;
const AGENT_PHONE_NUMBER = process.env.AGENT_PHONE_NUMBER || '+916363868580';

const handleIncomingCall = async (callData) => {
  const callSid = callData.CallSid || 'UNKNOWN';
  const callerNumber = callData.From || 'UNKNOWN';

  console.log(`📞 Incoming call received`);
  console.log(`Call SID: ${callSid}`);
  console.log(`Caller: ${callerNumber}`);

  // TwiML response — greets caller and gathers speech
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Welcome to 1092 Emergency Helpline. Please describe your emergency after the beep.
  </Say>
  <Record
    action="/api/telephony/call-status"
    maxLength="30"
    playBeep="true"
    transcribe="true"
    transcribeCallback="/api/telephony/call-status"
  />
</Response>`;

  return twiml;
};

const updateCallStatus = async (statusData) => {
  const transcriptionText = statusData.TranscriptionText || '';
  const callSid = statusData.CallSid || 'UNKNOWN';

  console.log(`📋 Call status update for: ${callSid}`);
  console.log(`Transcription: ${transcriptionText}`);

  if (transcriptionText) {
    try {
      // Send transcription to AI severity API
      const severityResponse = await axios.post(
        `${AI_SERVICE_URL}/analysis/severity`,
        { text: transcriptionText }
      );

      const severity = severityResponse.data.severity;
      console.log(`🚨 Severity detected: ${severity}`);

      // If HIGH or CRITICAL → forward to human agent
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        console.log(`🔴 ESCALATING to human agent!`);
        await forwardToAgent(callSid, severity);
      } else {
        console.log(`🟢 Severity is ${severity} — AI continues handling`);
      }
    } catch (error) {
      console.error('AI Service error:', error.message);
    }
  }
};

const forwardToAgent = async (callSid, severity) => {
  console.log(`📲 Forwarding call ${callSid} to agent`);
  console.log(`Severity: ${severity}`);
  console.log(`Agent number: ${AGENT_PHONE_NUMBER}`);

  return {
    callSid,
    severity,
    forwardedTo: AGENT_PHONE_NUMBER,
    status: 'FORWARDED',
    timestamp: new Date().toISOString()
  };
};

module.exports = { handleIncomingCall, updateCallStatus, forwardToAgent };
