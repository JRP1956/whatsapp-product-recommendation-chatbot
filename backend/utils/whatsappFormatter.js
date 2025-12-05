/**
 * WhatsApp-specific formatting utilities
 */

/**
 * Remove HTML tags and format text for WhatsApp
 */
function stripHtml(text) {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * Format text with WhatsApp markdown
 */
function formatForWhatsApp(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold
    .replace(/__(.*?)__/g, '_$1_') // Italic
    .replace(/`(.*?)`/g, '```$1```') // Monospace
    .replace(/~~(.*?)~~/g, '~$1~'); // Strikethrough
}

/**
 * Create a product card formatted for WhatsApp
 */
function createProductCard(product, index = 1) {
  let card = `*${index}. ${product.name}*\n`;
  card += `💰 *Price:* $${product.price}\n`;
  card += `⭐ *Rating:* ${product.rating}/5\n`;
  card += `🏢 *Brand:* ${product.brand}\n`;
  card += `🏷️ *Category:* ${product.category}\n\n`;
  card += `📝 *Description:*\n${product.description}\n`;
  
  if (product.features) {
    const features = product.features.split('|').slice(0, 4);
    card += `\n✨ *Key Features:*\n`;
    features.forEach(feature => {
      card += `• ${feature.trim()}\n`;
    });
  }
  
  return card;
}

/**
 * Create a compact product list for multiple products
 */
function createProductList(products, maxProducts = 3) {
  if (!products || products.length === 0) {
    return "❌ No products found matching your criteria.";
  }
  
  const limitedProducts = products.slice(0, maxProducts);
  let message = `🛍️ *Found ${products.length} products. Here are the top ${limitedProducts.length}:*\n\n`;
  
  limitedProducts.forEach((product, index) => {
    message += createProductCard(product, index + 1);
    if (index < limitedProducts.length - 1) {
      message += '\n' + '─'.repeat(30) + '\n\n';
    }
  });
  
  if (products.length > maxProducts) {
    message += `\n\n💡 *Want to see more options?* Type "show more products" to see additional ${products.length - maxProducts} items.`;
  }
  
  return message;
}

/**
 * Format price range message
 */
function formatPriceRange(min, max, currency = '$') {
  if (min && max) {
    return `${currency}${min} - ${currency}${max}`;
  } else if (min) {
    return `over ${currency}${min}`;
  } else if (max) {
    return `under ${currency}${max}`;
  }
  return '';
}

/**
 * Create help message
 */
function createHelpMessage() {
  return `🤖 *How to use this bot:*

*Search Commands:*
• "wireless mouse" - Find specific products
• "headphones under $100" - Price-based search
• "gaming accessories" - Category search
• "show me laptops" - General product search

*Helpful Commands:*
• "help" - Show this help message
• "start over" - Reset conversation
• "more details about [product]" - Get detailed info

*Example Queries:*
• "I need something for working from home"
• "Best rated electronics under $50"
• "Gift ideas for a programmer"
• "Portable accessories for travel"

Just tell me what you're looking for! 🔍`;
}

/**
 * Create error message for API failures
 */
function createErrorMessage(error) {
  const baseMessage = "⚠️ *Something went wrong*\n\n";
  
  if (error.includes('rate limit') || error.includes('429')) {
    return baseMessage + "I'm getting too many requests right now. Please wait a moment and try again.";
  }
  
  if (error.includes('network') || error.includes('timeout')) {
    return baseMessage + "Network connection issue. Please check your connection and try again.";
  }
  
  if (error.includes('OpenAI') || error.includes('API')) {
    return baseMessage + "The AI service is temporarily unavailable. Please try again in a few minutes.";
  }
  
  return baseMessage + "Please try again or type 'help' for assistance.";
}

/**
 * Validate and format phone number
 */
function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Add + if missing and number doesn't start with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Extract keywords from user message for better search
 */
function extractKeywords(message) {
  const commonWords = ['i', 'need', 'want', 'looking', 'for', 'show', 'me', 'find', 'get', 'buy', 'a', 'an', 'the', 'some', 'good', 'best', 'under', 'over', 'with', 'without'];
  
  return message
    .toLowerCase()
    .replace(/[^\w\s$]/g, '') // Remove special chars except $ for prices
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Limit to 10 keywords
}

/**
 * Create typing delay based on message length
 */
function calculateTypingDelay(message) {
  const wordsPerMinute = 200; // Average reading speed
  const words = message.split(' ').length;
  const readingTime = (words / wordsPerMinute) * 60 * 1000; // Convert to milliseconds
  
  // Add base delay and cap at reasonable limits
  const baseDelay = 1000; // 1 second base
  const maxDelay = 5000; // 5 seconds max
  const minDelay = 2000; // 2 seconds min
  
  return Math.min(Math.max(baseDelay + readingTime, minDelay), maxDelay);
}

module.exports = {
  stripHtml,
  formatForWhatsApp,
  createProductCard,
  createProductList,
  formatPriceRange,
  createHelpMessage,
  createErrorMessage,
  formatPhoneNumber,
  extractKeywords,
  calculateTypingDelay
};