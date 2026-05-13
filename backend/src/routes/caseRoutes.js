const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');

router.post('/analyze', caseController.analyzeCase);
router.post('/summarize', caseController.summarizeCase);
router.post('/pipeline/analyze', caseController.analyzePipeline);

module.exports = router;
