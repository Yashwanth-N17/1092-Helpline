const express = require("express");
const rtcBridge = require("../services/rtcBridgeService");

const router = express.Router();

// Manual escalation endpoint
router.post("/:callId/escalate", async (req, res) => {
  const { callId } = req.params;
  await rtcBridge.escalate(callId, "manual");
  res.json({ success: true, message: "Call escalated to human agent" });
});

module.exports = router;
