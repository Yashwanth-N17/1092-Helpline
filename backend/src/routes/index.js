const express = require('express');
const router = express.Router();
const replyRoutes = require('./replyRoutes');
const caseRoutes = require('./caseRoutes');
const telephonyRoutes = require('./telephonyRoutes');

router.use('/replies', replyRoutes);
router.use('/cases', caseRoutes);
router.use('/telephony', telephonyRoutes);

module.exports = router;