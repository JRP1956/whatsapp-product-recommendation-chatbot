const WhatsAppService = require('../services/whatsappService');
const { generateOpenAIResponse } = require('../services/openaiService');
const { normalizePhoneNumber, generateSessionId, isValidWhatsAppNumber } = require('../utils/phoneNumberValidator');
const { createHelpMessage, createErrorMessage, extractKeywords, calculateTypingDelay } = require('../utils/whatsappFormatter');

// In-memory storage for conversation sessions (use Redis in production)
const sessions = new Map();
const messageStatus = new Map(); // Track message delivery status

class WhatsAppController {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  /**
   * Webhook verification for Twilio
   */
  async verifyWebhook(req, res) {
    try {
      const token = req.query.hub_verify_token;
      const challenge = req.query.hub_challenge;
      
      if (token === process.env.WEBHOOK_AUTH_TOKEN) {
        console.log('Webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.error('Webhook verification failed');
        return res.status(403).send('Forbidden');
      }
    } catch (error) {
      console.error('Webhook verification error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Handle incoming WhatsApp messages
   */
  async handleIncomingMessage(req, res) {
    try {
      // Acknowledge receipt immediately
      res.status(200).send('OK');

      const { 
        From: fromNumber, 
        To: toNumber,
        Body: messageBody,
        MessageSid: messageSid,
        ProfileName: profileName,
        MediaUrl0: mediaUrl,
        MediaContentType0: mediaType,
        NumMedia: numMedia
      } = req.body;

      console.log('Incoming message:', {
        from: fromNumber,
        to: toNumber,
        body: messageBody,
        sid: messageSid,
        profileName,
        hasMedia: numMedia > 0
      });

      // Extract and validate phone number
      const phoneNumber = this.whatsappService.extractPhoneNumber(fromNumber);
      if (!isValidWhatsAppNumber(phoneNumber)) {
        console.error('Invalid WhatsApp number:', phoneNumber);
        return;
      }

      // Generate session ID from phone number
      const sessionId = generateSessionId(phoneNumber);

      // Handle media messages
      if (numMedia > 0) {
        await this.handleMediaMessage(phoneNumber, messageBody, mediaUrl, mediaType, sessionId);
        return;
      }

      // Handle text messages
      if (messageBody && messageBody.trim()) {
        await this.handleTextMessage(phoneNumber, messageBody.trim(), sessionId, profileName);
      }

    } catch (error) {
      console.error('Error handling incoming message:', error);
      // Don't send error to user here since we already acknowledged the webhook
    }
  }

  /**
   * Handle text messages
   */
  async handleTextMessage(phoneNumber, messageBody, sessionId, profileName) {
    try {
      // Show typing indicator (simulate)
      console.log(`Showing typing indicator for ${phoneNumber}`);
      
      // Get or create conversation session
      let conversationHistory = sessions.get(sessionId) || [];
      const products = require('../../data/products.json') || []; // Fallback to products data

      // Handle special commands
      const lowerMessage = messageBody.toLowerCase().trim();
      
      if (this.isHelpCommand(lowerMessage)) {
        const helpMessage = createHelpMessage();
        await this.sendResponse(phoneNumber, helpMessage);
        return;
      }

      if (this.isStartOverCommand(lowerMessage)) {
        sessions.delete(sessionId);
        const welcomeMessage = this.whatsappService.getWelcomeMessage();
        await this.sendResponse(phoneNumber, welcomeMessage);
        return;
      }

      // Check if this is the first message (welcome new users)
      if (conversationHistory.length === 0) {
        const welcomeMessage = this.whatsappService.getWelcomeMessage();
        await this.sendResponse(phoneNumber, welcomeMessage);
        
        // Add welcome to conversation history
        conversationHistory.push({
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date().toISOString()
        });
      }

      // Add user message to conversation history
      conversationHistory.push({
        role: 'user',
        content: messageBody,
        timestamp: new Date().toISOString(),
        profileName: profileName
      });

      // Calculate typing delay
      const typingDelay = calculateTypingDelay(messageBody);
      await new Promise(resolve => setTimeout(resolve, Math.min(typingDelay, 3000)));

      // Generate AI response
      const aiResponse = await generateOpenAIResponse(
        messageBody, 
        conversationHistory, 
        products
      );

      if (aiResponse) {
        // Add AI response to conversation history
        conversationHistory.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        });

        // Update session
        sessions.set(sessionId, conversationHistory);

        // Send formatted response
        await this.sendResponse(phoneNumber, aiResponse);

        console.log(`Response sent to ${phoneNumber}`);
      } else {
        throw new Error('No response generated from AI service');
      }

    } catch (error) {
      console.error(`Error processing message from ${phoneNumber}:`, error);
      
      const errorMessage = createErrorMessage(error.message || 'Unknown error');
      await this.sendResponse(phoneNumber, errorMessage);
    }
  }

  /**
   * Handle media messages
   */
  async handleMediaMessage(phoneNumber, caption, mediaUrl, mediaType, sessionId) {
    try {
      console.log(`Received media from ${phoneNumber}:`, { mediaType, mediaUrl });

      let response = "📷 Thanks for sending that! ";

      if (mediaType && mediaType.startsWith('image/')) {
        response += "I can see the image you sent. ";
      } else if (mediaType && mediaType.startsWith('audio/')) {
        response += "I received your voice message. ";
      } else {
        response += "I received your file. ";
      }

      response += "However, I currently focus on text-based product recommendations. Could you describe what you're looking for in text?";

      if (caption && caption.trim()) {
        response += `\n\nI see you wrote: "${caption}". Let me help you with that!`;
        // Process the caption as a regular text message
        await this.handleTextMessage(phoneNumber, caption, sessionId);
        return;
      }

      await this.sendResponse(phoneNumber, response);

    } catch (error) {
      console.error(`Error handling media from ${phoneNumber}:`, error);
      const errorMessage = createErrorMessage('Error processing media');
      await this.sendResponse(phoneNumber, errorMessage);
    }
  }

  /**
   * Send response with message chunking
   */
  async sendResponse(phoneNumber, message) {
    try {
      const chunks = this.whatsappService.formatMessage(message);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Add chunk indicator for multi-part messages
        let finalMessage = chunk;
        if (chunks.length > 1) {
          finalMessage = `📄 *Part ${i + 1}/${chunks.length}*\n\n${chunk}`;
        }

        const response = await this.whatsappService.sendMessage(phoneNumber, finalMessage);
        
        // Track message status
        if (response && response.sid) {
          messageStatus.set(response.sid, {
            phoneNumber,
            status: 'sent',
            timestamp: new Date(),
            chunk: i + 1,
            totalChunks: chunks.length
          });
        }

        // Add delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error(`Error sending response to ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Handle message status updates (delivery, read receipts)
   */
  async handleStatusUpdate(req, res) {
    try {
      res.status(200).send('OK');

      const {
        MessageSid: messageSid,
        MessageStatus: status,
        ErrorCode: errorCode,
        ErrorMessage: errorMessage
      } = req.body;

      console.log('Message status update:', {
        sid: messageSid,
        status,
        errorCode,
        errorMessage
      });

      // Update message status in our tracking
      if (messageStatus.has(messageSid)) {
        const messageInfo = messageStatus.get(messageSid);
        messageInfo.status = status;
        messageInfo.lastUpdated = new Date();
        
        if (errorCode) {
          messageInfo.errorCode = errorCode;
          messageInfo.errorMessage = errorMessage;
        }
        
        messageStatus.set(messageSid, messageInfo);
        
        console.log(`Message ${messageSid} status updated to: ${status}`);
        
        // Handle failed messages
        if (status === 'failed' || status === 'undelivered') {
          console.error(`Message failed to ${messageInfo.phoneNumber}:`, {
            errorCode,
            errorMessage
          });
          
          // Could implement retry logic here
          // await this.handleFailedMessage(messageInfo);
        }
      }

    } catch (error) {
      console.error('Error handling status update:', error);
    }
  }

  /**
   * Get conversation history for a phone number
   */
  getConversationHistory(phoneNumber) {
    const sessionId = generateSessionId(phoneNumber);
    return sessions.get(sessionId) || [];
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(phoneNumber) {
    const sessionId = generateSessionId(phoneNumber);
    sessions.delete(sessionId);
    return true;
  }

  /**
   * Get message delivery statistics
   */
  getMessageStats(phoneNumber = null) {
    const stats = {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0
    };

    for (const [sid, info] of messageStatus.entries()) {
      if (phoneNumber && info.phoneNumber !== phoneNumber) {
        continue;
      }

      stats.total++;
      switch (info.status) {
        case 'sent': stats.sent++; break;
        case 'delivered': stats.delivered++; break;
        case 'read': stats.read++; break;
        case 'failed':
        case 'undelivered': stats.failed++; break;
      }
    }

    return stats;
  }

  /**
   * Helper methods
   */
  isHelpCommand(message) {
    const helpKeywords = ['help', '?', 'how', 'what can you do', 'commands', 'info'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  isStartOverCommand(message) {
    const startOverKeywords = ['start over', 'restart', 'reset', 'clear', 'begin again', 'new conversation'];
    return startOverKeywords.some(keyword => message.includes(keyword));
  }
}

module.exports = WhatsAppController;