import React from 'react';
import ProductCard from './ProductCard';

const ChatMessage = ({ message, isUser }) => {
  // Parse product recommendations from AI response
  const parseProducts = (text) => {
    const products = [];
    const productRegex = /\*\*\[PRODUCT_START\]\*\*\s*Product Name:\s*(.+?)\s*Price:\s*\$?(\d+\.?\d*)\s*(?:Image:\s*(https?:\/\/[^\s]+))?\s*Description:\s*(.+?)\s*\*\*\[PRODUCT_END\]\*\*/gs;
    
    let match;
    while ((match = productRegex.exec(text)) !== null) {
      products.push({
        name: match[1].trim(),
        price: parseFloat(match[2]),
        image: match[3] || null,
        description: match[4].trim()
      });
    }
    
    return products;
  };

  if (!isUser) {
    const products = parseProducts(message);
    
    if (products.length > 0) {
      // Remove product blocks from the message text
      const cleanMessage = message.replace(/\*\*\[PRODUCT_START\]\*\*[\s\S]*?\*\*\[PRODUCT_END\]\*\*/g, '').trim();
      
      return (
        <div className="flex justify-start mb-4">
          <div className="max-w-lg bg-gray-100 rounded-lg p-4">
            {cleanMessage && (
              <p className="text-sm text-gray-800 mb-4 whitespace-pre-wrap">{cleanMessage}</p>
            )}
            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;