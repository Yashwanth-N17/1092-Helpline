const express = require('express');
const router = express.Router();
const replyRoutes = require('./replyRoutes');
const caseRoutes = require('./caseRoutes');

router.use('/replies', replyRoutes);
router.use('/cases', caseRoutes);

module.exports = router;
