const twilio = require('twilio');
const crypto = require('crypto');

class WhatsAppService {
  constructor() {
    // Only initialize Twilio client if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.log('⚠️  WhatsApp Service: Twilio credentials not configured - running in demo mode');
      this.client = null;
    }
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendMessage(to, message) {
    try {
      if (!this.client) {
        console.log(`📱 [DEMO MODE] Would send to ${to}: ${message}`);
        return { sid: 'demo_message_' + Date.now(), status: 'sent' };
      }

      const response = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${to}`,
        body: message
      });
      
      console.log(`Message sent to ${to}: ${response.sid}`);
      return response;
    } catch (error) {
      console.error(`Error sending message to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send a media message (image, document) via WhatsApp
   */
  async sendMediaMessage(to, mediaUrl, caption = '') {
    try {
      const response = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${to}`,
        mediaUrl: [mediaUrl],
        body: caption
      });
      
      console.log(`Media message sent to ${to}: ${response.sid}`);
      return response;
    } catch (error) {
      console.error(`Error sending media message to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(to) {
    // Note: Twilio doesn't directly support typing indicators for WhatsApp
    // This is a placeholder for future implementation or third-party solutions
    console.log(`Typing indicator sent to ${to}`);
    return true;
  }

  /**
   * Format message for WhatsApp constraints
   */
  formatMessage(message) {
    // WhatsApp has a 4096 character limit
    if (message.length > 4096) {
      return this.splitLongMessage(message);
    }
    return [message];
  }

  /**
   * Split long messages into chunks
   */
  splitLongMessage(message, maxLength = 4000) {
    const chunks = [];
    let currentChunk = '';
    const lines = message.split('\n');
    
    for (const line of lines) {
      if ((currentChunk + line + '\n').length > maxLength) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // If a single line is too long, split it
        if (line.length > maxLength) {
          const words = line.split(' ');
          let tempLine = '';
          
          for (const word of words) {
            if ((tempLine + word + ' ').length > maxLength) {
              if (tempLine.trim()) {
                chunks.push(tempLine.trim());
                tempLine = '';
              }
              tempLine = word + ' ';
            } else {
              tempLine += word + ' ';
            }
          }
          
          if (tempLine.trim()) {
            currentChunk = tempLine;
          }
        } else {
          currentChunk = line + '\n';
        }
      } else {
        currentChunk += line + '\n';
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Verify webhook signature for security
   */
  verifyWebhook(signature, body, authToken) {
    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(body)
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Extract phone number from WhatsApp format
   */
  extractPhoneNumber(whatsappNumber) {
    // Remove 'whatsapp:' prefix and return clean phone number
    return whatsappNumber.replace('whatsapp:', '');
  }

  /**
   * Check message delivery status
   */
  async getMessageStatus(messageSid) {
    try {
      if (!this.client) {
        return {
          sid: messageSid,
          status: 'delivered',
          direction: 'outbound-api',
          errorCode: null,
          errorMessage: null,
          dateCreated: new Date(),
          dateSent: new Date(),
          dateUpdated: new Date()
        };
      }

      const message = await this.client.messages(messageSid).fetch();
      return {
        sid: message.sid,
        status: message.status,
        direction: message.direction,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      console.error(`Error fetching message status for ${messageSid}:`, error);
      throw error;
    }
  }

  /**
   * Format product recommendations for WhatsApp
   */
  formatProductsForWhatsApp(products, userQuery) {
    if (!products || products.length === 0) {
      return "I couldn't find any products matching your request. Please try a different search term.";
    }

    let message = `🔍 *Here are my top recommendations for: "${userQuery}"*\n\n`;
    
    products.forEach((product, index) => {
      message += `*${index + 1}. ${product.name}*\n`;
      message += `💰 Price: $${product.price}\n`;
      message += `⭐ Rating: ${product.rating}/5\n`;
      message += `📝 ${product.description}\n`;
      
      if (product.features) {
        const features = product.features.split('|').slice(0, 3); // Limit features
        message += `✨ Key features: ${features.join(', ')}\n`;
      }
      
      message += `🏷️ Category: ${product.category}\n`;
      message += `🏢 Brand: ${product.brand}\n`;
      
      if (index < products.length - 1) {
        message += '\n---\n\n';
      }
    });
    
    message += '\n\n💬 *Need more info about any product? Just ask!*';
    
    return message;
  }

  /**
   * Format welcome message
   */
  getWelcomeMessage() {
    return `👋 *Welcome to our AI Product Recommendation Bot!*

I'm here to help you find the perfect products! 

You can ask me things like:
• "I need a good wireless mouse"
• "Show me headphones under $100"
• "What's good for gaming?"
• "I work from home, what do you recommend?"

Just tell me what you're looking for and I'll find the best options for you! 🛍️`;
  }

  /**
   * Format error message for WhatsApp
   */
  formatErrorMessage(error = 'Something went wrong') {
    return `❌ *Oops!* ${error}\n\nPlease try again or contact support if the problem persists.`;
  }
}

module.exports = WhatsAppService;