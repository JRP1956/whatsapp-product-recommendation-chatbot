const { generateRecommendation } = require('../services/openaiService');

// In-memory storage for conversation sessions (MVP only)
const sessions = new Map();

const handleChatMessage = async (req, res) => {
  try {
    const { message, sessionId, phoneNumber } = req.body;
    const products = req.app.locals.products;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use phoneNumber as sessionId if provided (WhatsApp integration)
    let effectiveSessionId = sessionId;
    if (phoneNumber) {
      // For WhatsApp, use phone number as session identifier
      const { generateSessionId } = require('../utils/phoneNumberValidator');
      effectiveSessionId = generateSessionId(phoneNumber);
    }

    if (!effectiveSessionId) {
      // Generate a new session ID for web clients
      effectiveSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get or create session
    let conversationHistory = sessions.get(effectiveSessionId) || [];

    // Generate AI response
    const aiResponse = await generateRecommendation(
      message,
      products,
      conversationHistory
    );

    // Update conversation history (keep last 5 exchanges)
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );
    
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
    sessions.set(effectiveSessionId, conversationHistory);

    res.json({
      message: aiResponse,
      sessionId: effectiveSessionId,
      phoneNumber: phoneNumber || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

const clearSession = (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.json({ message: 'Session cleared' });
};

module.exports = { handleChatMessage, clearSession };