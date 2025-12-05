const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const products = req.app.locals.products;
  res.json(products);
});

router.get('/:id', (req, res) => {
  const products = req.app.locals.products;
  const product = products.find(p => p.productId === req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

module.exports = router;