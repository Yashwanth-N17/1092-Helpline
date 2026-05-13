const express = require('express');
const router = express.Router();
const caseRoutes = require('./caseRoutes');

router.use('/cases', caseRoutes);

module.exports = router;
