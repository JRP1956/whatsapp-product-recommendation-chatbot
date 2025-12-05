const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const { parseCSV } = require('./utils/csvParser');
const chatRoutes = require('./routes/chatRoutes');
const productRoutes = require('./routes/productRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Body parsing middleware for different content types
app.use('/api/whatsapp/webhook', bodyParser.urlencoded({ extended: false })); // For Twilio webhooks
app.use('/api/whatsapp/status', bodyParser.urlencoded({ extended: false })); // For status updates
app.use(express.json()); // For regular JSON API calls

// Raw body parser for webhook signature verification (if needed)
app.use('/api/whatsapp/webhook', bodyParser.raw({ type: 'application/json' }));

// Load products from CSV on startup
const loadProducts = async () => {
  try {
    const csvPath = path.join(__dirname, 'data', 'products.csv');
    const products = await parseCSV(csvPath);
    app.locals.products = products;
    console.log(`Loaded ${products.length} products from CSV`);
  } catch (error) {
    console.error('Error loading products:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/products', productRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', products: app.locals.products?.length || 0 });
});

// Start server
const startServer = async () => {
  await loadProducts();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();