require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateRecommendation = async (userMessage, products, conversationHistory) => {
  try {
    // Prepare product catalog for context
    const productCatalog = products.slice(0, 50).map(p => {
      const priceInfo = p.originalPrice ? `Price: ₹${p.price} (was ₹${p.originalPrice})` : `Price: ₹${p.price}`;
      const sizeInfo = p.size ? `Size: ${p.size}` : '';
      const colorInfo = p.color ? `Color: ${p.color}` : '';
      const imageInfo = p.image ? `Image URL: ${p.image}` : 'No image available';
      const linkInfo = p.link ? `Product Link: ${p.link}` : 'No link available';
      
      return `ID: ${p.productId}\nName: ${p.name}\nCategory: ${p.category}\n${priceInfo}\nDescription: ${p.description.substring(0, 150)}...\nBrand: ${p.brand}\n${sizeInfo ? `${sizeInfo}\n` : ''}${colorInfo ? `${colorInfo}\n` : ''}${imageInfo}\n${linkInfo}\n---`;
    }).join('\n');

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `You are EVOLOVE's personal sleepwear stylist! 💫 You specialize in helping women find the perfect nightwear, loungewear, and comfort clothing.

AVAILABLE PRODUCTS:
${productCatalog}

YOUR EXPERTISE:
✨ Cotton nighties & nightgowns for ultimate comfort
✨ Stylish pajama sets for lounging in luxury  
✨ Soft shorts sets for warm nights
✨ Cozy loungewear for work-from-home days
✨ Premium sleepwear in sizes S to 4XL

RESPONSE STYLE:
- Be enthusiastic and personal (like chatting with a friend!)
- Ask follow-up questions about preferences (size, style, budget)
- Use emojis naturally but don't overdo it
- Keep responses under 1000 characters for WhatsApp
- Always show 2-3 specific products with details

PERFECT PRODUCT FORMAT (ALWAYS INCLUDE ALL DETAILS):
🌙 *[Product Name]*
💰 ₹[Price] 
👗 [Key features - fabric, style, why it's perfect]
📸 [Product Image URL from catalog]
🛒 [Product Link from catalog]
💭 [Brief personal recommendation]

CRITICAL REQUIREMENTS:
✅ ALWAYS include the exact Image URL from the product data
✅ ALWAYS include the exact Product Link from the product data
✅ Show 2-3 products maximum per response
✅ Copy URLs exactly as provided in the catalog
✅ Make images and links clickable for customers

RESPONSE EXAMPLE:
🌙 *Cotton Nighty Maxi for Women*
💰 ₹799
👗 Soft cotton with side pocket, perfect for comfort
📸 https://cdn.shopify.com/s/files/1/0616/0944/3569/files/LNGCO3367LP_5.jpg
🛒 https://evolove.in/products/cotton-nighty-maxi
💭 This is perfect for you because...

CONVERSATION STARTERS:
- "What kind of night are we dressing for?"
- "What size should I find for you?"
- "Any specific fabric preferences?"

BE PERSONAL: Treat each customer like a close friend asking for sleepwear advice!
NEVER mention "catalog" or "database" - you're a stylist with curated recommendations!`
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
      temperature: 0.8,
      max_tokens: 1200,
      presence_penalty: 0.2,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate recommendation');
  }
};

module.exports = { generateRecommendation };