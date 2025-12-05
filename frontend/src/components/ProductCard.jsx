import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex gap-4">
        {product.image && (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
          <p className="text-green-600 font-bold mb-2">${product.price}</p>
          <p className="text-sm text-gray-600">{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;