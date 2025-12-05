require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateRecommendation = async (userMessage, products, conversationHistory) => {
  try {
    // Prepare product catalog for context
    const productCatalog = products.slice(0, 50).map(p => {
      const priceInfo = p.originalPrice ? `Price: $${p.price} (was $${p.originalPrice})` : `Price: $${p.price}`;
      const sizeInfo = p.size ? `Size: ${p.size}` : '';
      const colorInfo = p.color ? `Color: ${p.color}` : '';
      const imageInfo = p.image ? `Image: ${p.image}` : '';
      
      return `ID: ${p.productId}, Name: ${p.name}, Category: ${p.category}, ${priceInfo}, Description: ${p.description.substring(0, 200)}..., Brand: ${p.brand}${sizeInfo ? `, ${sizeInfo}` : ''}${colorInfo ? `, ${colorInfo}` : ''}${imageInfo ? `, ${imageInfo}` : ''}`;
    }).join('\n');

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `You are a helpful product recommendation assistant for EVOLOVE, a sleepwear and loungewear brand. You have access to the following product catalog:

${productCatalog}

Your task is to:
1. Understand the user's requirements from their query
2. Recommend the top 3 most suitable products from the catalog
3. Provide clear reasons for each recommendation
4. Include product images when available
5. Be conversational and friendly

IMPORTANT: You are now responding to users via WhatsApp messages. Follow these formatting guidelines:

1. Use WhatsApp markdown: *bold*, _italic_, ~strikethrough~, \`\`\`monospace\`\`\`
2. Keep responses under 4000 characters per message
3. Use emojis appropriately to make messages engaging
4. For product recommendations, use this WhatsApp-optimized format:

*🛍️ Product Name*
💰 Price: $XX.XX
⭐ Rating: X.X/5
🏢 Brand: Brand Name
📝 Brief description and why it's suitable

5. Structure multiple products with clear separators
6. End with helpful next steps or questions
7. Keep language conversational and mobile-friendly

CRITICAL: Always include the Image URL from the product catalog when available. Copy the exact image URL provided in the product data.
Always use the exact product names from the catalog.
Focus on sleepwear, nightwear, loungewear, pajamas, and related comfort clothing.

Example response:
"Here are my top recommendations for you:

**[PRODUCT_START]**
Product Name: Cotton Nighty Maxi for Women with Side Pocket
Price: $799
Image: https://cdn.shopify.com/s/files/1/0616/0944/3569/files/LNGCO3367LP_5.jpg
Description: This comfortable cotton nightgown features a side pocket and is perfect for a good night's sleep.
**[PRODUCT_END]**"`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate recommendation');
  }
};

module.exports = { generateRecommendation };