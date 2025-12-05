# AI Product Recommendation WhatsApp Bot - MVP

An intelligent WhatsApp chatbot that recommends products based on user queries using OpenAI API and Twilio's WhatsApp Business API.

## Features

- 📱 **WhatsApp Integration**: Native WhatsApp messaging experience
- 🤖 **AI-Powered Recommendations**: Context-aware responses using OpenAI GPT-3.5-turbo
- 📦 **Product Catalog**: Searchable database of tech products loaded from CSV
- 💬 **Natural Language Processing**: Understands conversational queries
- 📊 **Message Status Tracking**: Delivery, read receipts, and typing indicators
- 🔄 **Session Management**: Phone number-based conversation continuity
- 📱 **Mobile-Optimized**: WhatsApp-specific formatting and emojis
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
- Media message handling
- Message chunking for long responses
- WhatsApp-specific formatting (emojis, markdown)
- Phone number validation and normalization

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
   "I need a good wireless mouse"
   "Show me headphones under $100" 
   "What's good for gaming?"
   "Help me find work-from-home accessories"
   ```
4. **Special Commands**:
   - `help` - Show available commands
   - `start over` - Reset conversation history
5. **Media Support**: Send images with captions for context
6. **Continuous Chat**: Your conversation history is maintained per phone number

## Sample WhatsApp Queries

- 💬 "I need headphones for music production"
- 💰 "Show me tech accessories under $50"
- 🎁 "What's a good gift for a programmer?"
- 💻 "I want something portable for my laptop"
- ⭐ "Best rated electronics in your catalog"
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

The app includes 15 sample products across categories:
- **Electronics**: Mice, keyboards, webcams, chargers, smartwatch
- **Audio**: Earbuds, speakers, headphones
- **Accessories**: Stands, hubs, organizers, screen protectors

## Customization

### Adding Products
Edit `backend/data/products.csv` with your product data:
```csv
product_id,name,category,price,description,features,brand,rating
P016,New Product,Category,29.99,Description here,Feature1|Feature2,Brand,4.5
```

### Modifying AI Behavior
Edit the system prompt in `backend/services/openaiService.js` to change how the AI responds.

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

- **OpenAI API**: ~$0.002 per conversation (GPT-3.5-turbo)
- **Hosting**: Free tier available (Railway + Vercel)
- **Estimated monthly cost for 1000 users**: $10-20

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
2. **Advanced AI**: Implement conversation memory and user preferences
3. **Media Support**: Handle product images and voice messages
4. **Multi-language**: Add support for multiple languages
5. **Order Integration**: Connect with e-commerce platforms
6. **Customer Support**: Escalation to human agents

## License

MIT License - feel free to use this project as a starting point for your own applications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

For questions or support, please open an issue in the repository.