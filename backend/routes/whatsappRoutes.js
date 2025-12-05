const express = require('express');
const WhatsAppController = require('../controllers/whatsappController');

const router = express.Router();
const whatsappController = new WhatsAppController();

/**
 * Webhook verification endpoint (GET)
 * Used by WhatsApp/Twilio to verify the webhook URL
 */
router.get('/webhook', async (req, res) => {
  await whatsappController.verifyWebhook(req, res);
});

/**
 * Webhook endpoint for incoming messages (POST)
 * Receives all WhatsApp message events
 */
router.post('/webhook', async (req, res) => {
  await whatsappController.handleIncomingMessage(req, res);
});

/**
 * Status webhook endpoint (POST)
 * Receives message delivery status updates
 */
router.post('/status', async (req, res) => {
  await whatsappController.handleStatusUpdate(req, res);
});

/**
 * API endpoint to get conversation history
 * GET /api/whatsapp/conversation/:phoneNumber
 */
router.get('/conversation/:phoneNumber', (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const history = whatsappController.getConversationHistory(phoneNumber);
    
    res.json({
      phoneNumber,
      conversationHistory: history,
      messageCount: history.length
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

/**
 * API endpoint to clear conversation history
 * DELETE /api/whatsapp/conversation/:phoneNumber
 */
router.delete('/conversation/:phoneNumber', (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const cleared = whatsappController.clearConversationHistory(phoneNumber);
    
    res.json({
      phoneNumber,
      cleared,
      message: 'Conversation history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing conversation history:', error);
    res.status(500).json({ error: 'Failed to clear conversation history' });
  }
});

/**
 * API endpoint to get message delivery statistics
 * GET /api/whatsapp/stats/:phoneNumber (optional phoneNumber)
 */
router.get('/stats/:phoneNumber?', (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const stats = whatsappController.getMessageStats(phoneNumber);
    
    res.json({
      phoneNumber: phoneNumber || 'all',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ error: 'Failed to fetch message statistics' });
  }
});

/**
 * Health check endpoint for WhatsApp service
 * GET /api/whatsapp/health
 */
router.get('/health', (req, res) => {
  try {
    const requiredEnvVars = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_WHATSAPP_NUMBER',
      'OPENAI_API_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return res.status(500).json({
        status: 'error',
        message: 'Missing required environment variables',
        missingVars
      });
    }
    
    res.json({
      status: 'healthy',
      service: 'WhatsApp Bot',
      timestamp: new Date().toISOString(),
      config: {
        twilioConfigured: !!process.env.TWILIO_ACCOUNT_SID,
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
});

module.exports = router;