const express = require("express");
const CallController = require("../controllers/callController");

const router = express.Router();

router.get("/active", CallController.getActiveCalls);
router.get("/:id", CallController.getCallDetail);
router.patch("/:id/interpret", CallController.updateInterpretation);
router.post("/:id/end", CallController.endCall);
router.post("/:id/escalate", CallController.escalateCall);

module.exports = router;
