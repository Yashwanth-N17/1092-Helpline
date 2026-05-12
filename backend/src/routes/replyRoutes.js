const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');

router.post('/generate', replyController.generateReply);

module.exports = router;
