const fs = require('fs');
const csv = require('csv-parser');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const products = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Handle both new simple format and old Shopify format
        let product = null;
        
        if (row.product_id && row.name) {
          // New simple tech products format
          product = {
            productId: row.product_id,
            handle: row.product_id,
            name: row.name,
            category: row.category || 'General',
            price: parseFloat(row.price) || 0,
            originalPrice: null,
            description: row.description || '',
            features: row.features ? row.features.split('|') : [],
            brand: row.brand || 'Generic',
            image: row.image_url || null,
            published: true,
            rating: parseFloat(row.rating) || 4.0,
            size: null,
            color: null
          };
        } else if (row.Handle && row.Title && row['Variant Price'] && parseFloat(row['Variant Price']) > 0) {
          // Old Shopify format
          const features = row.Tags ? row.Tags.split(',').map(tag => tag.trim()) : [];
          const description = row['Body (HTML)'] 
            ? row['Body (HTML)'].replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
            : row.Title;
          
          product = {
            productId: row['Variant SKU'] || row.Handle,
            handle: row.Handle,
            name: row.Title,
            category: row.Type || 'General',
            price: parseFloat(row['Variant Price']),
            originalPrice: row['Variant Compare At Price'] ? parseFloat(row['Variant Compare At Price']) : null,
            description: description.substring(0, 500),
            features: features.slice(0, 10),
            brand: row.Vendor || 'EVOLOVE',
            image: row['Image Src'] || null,
            published: row.Published === 'true',
            size: row['Option1 Value'] || null,
            color: row['Option2 Value'] || null
          };
        }
        
        if (product && product.price > 0) {
          products.push(product);
        }
      })
      .on('end', () => {
        // Remove duplicates based on handle (keep first occurrence which is usually the main product)
        const uniqueProducts = [];
        const seen = new Set();
        
        for (const product of products) {
          if (!seen.has(product.handle) && product.published) {
            seen.add(product.handle);
            uniqueProducts.push(product);
          }
        }
        
        console.log(`Processed ${products.length} product variants, returning ${uniqueProducts.length} unique published products`);
        resolve(uniqueProducts);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

module.exports = { parseCSV };