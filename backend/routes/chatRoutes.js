const express = require('express');
const { handleChatMessage, clearSession } = require('../controllers/chatController');

const router = express.Router();

router.post('/message', handleChatMessage);
router.delete('/session/:sessionId', clearSession);

module.exports = router;