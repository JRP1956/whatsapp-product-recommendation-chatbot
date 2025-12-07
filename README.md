# EVOLOVE WhatsApp Sleepwear Stylist Bot

An intelligent WhatsApp chatbot that acts as a personal sleepwear stylist for EVOLOVE, recommending comfortable nightwear and loungewear products using OpenAI API and Twilio's WhatsApp Business API.

## Features

- 📱 **WhatsApp Integration**: Native WhatsApp messaging experience
- 🤖 **AI-Powered Personal Stylist**: Conversational recommendations using OpenAI GPT-3.5-turbo
- 📦 **Product Catalog**: Curated database of sleepwear & loungewear loaded from CSV
- 💬 **Natural Language Processing**: Understands conversational queries about comfort, style, and preferences
- 📸 **Image Support**: Sends product images directly in WhatsApp messages
- 📊 **Message Status Tracking**: Delivery, read receipts, and typing indicators
- 🔄 **Session Management**: Phone number-based conversation continuity
- 📱 **Mobile-Optimized**: WhatsApp-specific formatting with emojis
- ⚡ **Real-time Processing**: Instant responses via webhooks

## Technology Stack

### Backend
- Node.js & Express.js
- **Twilio WhatsApp Business API** - Message sending and webhook handling
- OpenAI API integration (GPT-3.5-turbo)
- CSV file parsing for product data
- Phone number-based session management
- Webhook signature verification for security

### WhatsApp Features
- Message delivery status tracking
- Typing indicators (simulated)
- Media message handling (product images)
- Automatic image extraction and sending from AI responses
- Message chunking for long responses
- WhatsApp-specific formatting (emojis, markdown)
- Phone number validation and normalization
- Smart help command detection (avoids false triggers)

## Quick Setup Instructions

### Prerequisites
- Node.js 16+ installed
- OpenAI API key (get one at https://platform.openai.com/)
- Twilio account (free tier available)
- ngrok for local development (optional for production)

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
WEBHOOK_URL=https://your-domain.ngrok.io
WEBHOOK_AUTH_TOKEN=your_webhook_secret
```

### 3. Start the Server

```bash
npm run dev
```

### 4. Set Up WhatsApp (Development)

1. **Join Twilio Sandbox**: Send `join <sandbox-word>` to `+1 415 523 8886`
2. **Configure Webhooks** in Twilio Console:
   - Incoming messages: `https://your-ngrok-url.com/api/whatsapp/webhook`
   - Status updates: `https://your-ngrok-url.com/api/whatsapp/status`

**📋 For detailed setup instructions, see [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md)**

## Usage Guide (WhatsApp)

1. **Join Sandbox**: Send `join <sandbox-word>` to the Twilio WhatsApp number
2. **Start Chatting**: Send any message to begin the conversation
3. **Get Recommendations**: Ask for products using natural language:
   ```
   "I need comfortable sleepwear"
   "Show me cotton nighties"
   "What's good for hot summer nights?"
   "I want loungewear for work from home"
   "Do you have pajama sets in XL?"
   ```
4. **Special Commands**:
   - `help` - Show available commands
   - `start over` - Reset conversation history
5. **Product Images**: The bot automatically sends product images from the catalog
6. **Continuous Chat**: Your conversation history is maintained per phone number
7. **Personal Styling**: The AI acts as your personal sleepwear stylist with friendly recommendations

## Sample WhatsApp Queries

- 🌙 "I need something comfortable for sleeping"
- 💰 "Show me nightwear under ₹1000"
- 🎁 "What's a good gift for my sister?"
- ☀️ "I want something light for summer"
- ⭐ "What's your most popular nightgown?"
- 👗 "Do you have plus-size loungewear?"
- ❓ "Help" (for command list)

## API Endpoints

### WhatsApp Endpoints
- `POST /api/whatsapp/webhook` - Receive incoming WhatsApp messages
- `GET /api/whatsapp/webhook` - Webhook verification for Twilio
- `POST /api/whatsapp/status` - Message delivery status updates
- `GET /api/whatsapp/health` - WhatsApp service health check
- `GET /api/whatsapp/conversation/:phoneNumber` - Get conversation history
- `DELETE /api/whatsapp/conversation/:phoneNumber` - Clear conversation
- `GET /api/whatsapp/stats/:phoneNumber?` - Message delivery statistics

### Legacy Chat Endpoints (Web Interface)
- `POST /api/chat/message` - Send a message and get AI response
- `DELETE /api/chat/session/:sessionId` - Clear conversation history

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `GET /api/health` - General health check

## Product Catalog

The app includes EVOLOVE's sleepwear and loungewear collection:
- **Nightwear**: Cotton nighties, nightgowns, night dresses
- **Loungewear**: Pajama sets, shorts sets, lounge sets
- **Sleepwear**: Sleep dresses, sleep shirts
- **Sizes**: S to 4XL available
- **Features**: Product images, direct purchase links, detailed descriptions

Each product includes:
- Product name, category, and brand
- Price in INR (₹)
- Size and color options
- High-quality product images
- Direct links to EVOLOVE store
- Detailed descriptions and features

## Customization

### Adding Products
Edit `backend/data/products.csv` with your product data:
```csv
product_id,name,category,price,original_price,description,brand,image,link,size,color,rating
P016,Cotton Night Dress,Nightwear,899,1299,Comfortable cotton night dress,EVOLOVE,https://...,L,Blue,4.5
```

### Modifying AI Behavior
Edit the system prompt in `backend/services/openaiService.js` to:
- Change the chatbot's personality and tone
- Adjust product recommendation style
- Modify response formatting
- Update conversation starters and questions

## Troubleshooting

### Common Issues

1. **CORS Error**:
   - Ensure backend server is running on port 5000
   - Check that CORS is enabled in `server.js`

2. **OpenAI API Error**:
   - Verify your API key is correct in `.env`
   - Ensure your OpenAI account has credits
   - Check API key permissions

3. **Products Not Loading**:
   - Verify `products.csv` file exists in `backend/data/`
   - Check CSV format matches expected structure
   - Look at server console for error messages

4. **Port Already in Use**:
   ```bash
   # Kill process using port 5000
   lsof -ti:5000 | xargs kill
   ```
   Or change the PORT in `.env` file

5. **Frontend Can't Connect to Backend**:
   - Ensure backend is running on http://localhost:5000
   - Check proxy setting in `frontend/package.json`

### Development Tips

- Use browser DevTools Network tab to debug API calls
- Check browser console for frontend errors
- Monitor backend console for server-side issues
- Test API endpoints directly with tools like Postman

## Cost Estimation

- **OpenAI API**: ~$0.002-0.004 per conversation (GPT-3.5-turbo)
- **Twilio WhatsApp**: Free sandbox for development, production pricing varies by region
- **Hosting**: Free tier available (Railway, Render, Heroku)
- **Estimated monthly cost for 1000 active conversations**: $15-30

## Next Steps for Production

### WhatsApp Production Setup
1. **WhatsApp Business API**: Upgrade from sandbox to production WhatsApp Business Account
2. **Webhook Security**: Implement proper webhook signature verification
3. **Rate Limiting**: Add message rate limiting to prevent spam
4. **Message Templates**: Set up approved WhatsApp message templates

### Infrastructure
1. **Database Integration**: Replace in-memory storage with MongoDB/PostgreSQL + Redis
2. **Scalability**: Deploy on cloud platforms (Railway, Vercel, AWS)
3. **Monitoring**: Add error tracking (Sentry) and analytics
4. **Security**: Implement proper authentication and data encryption

### Features
1. **Product Management**: Admin panel for managing product catalog
2. **Advanced AI**: User preferences learning and personalized recommendations
3. **Enhanced Media Support**: Voice messages and customer photo uploads for sizing help
4. **Multi-language**: Support for Hindi, regional languages
5. **E-commerce Integration**: Direct checkout and order tracking via WhatsApp
6. **Size Recommendations**: AI-powered size suggestions based on customer inputs
7. **Customer Support**: Escalation to human agents for complex queries
8. **Analytics Dashboard**: Track popular products, conversion rates, and customer satisfaction

## License

MIT License - feel free to use this project as a starting point for your own applications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

For questions or support, please open an issue in the repository.