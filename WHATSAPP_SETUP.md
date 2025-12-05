# WhatsApp Chatbot Setup Guide

This guide will help you set up the AI Product Recommendation Chatbot to work with WhatsApp using Twilio's WhatsApp Business API.

## Prerequisites

1. **Node.js 16+** installed on your system
2. **Twilio Account** (free tier available)
3. **OpenAI API Key** 
4. **ngrok** (for webhook testing during development)
5. **WhatsApp Business Account** (for production)

## Step 1: Twilio Setup

### 1.1 Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com)
2. Sign up for a free account
3. Verify your phone number

### 1.2 WhatsApp Sandbox Setup (Development)
1. In Twilio Console, navigate to **Messaging > Try it out > Send a WhatsApp message**
2. Follow the instructions to join the WhatsApp Sandbox:
   - Send `join <your-sandbox-keyword>` to the Twilio WhatsApp number
   - Example: Send `join coffee-banana` to `+1 415 523 8886`
3. Note down your Sandbox WhatsApp number (usually `+1 415 523 8886`)

### 1.3 Get Twilio Credentials
1. From your [Twilio Console Dashboard](https://console.twilio.com)
2. Copy your:
   - **Account SID**
   - **Auth Token**
   - **WhatsApp Phone Number** (sandbox number for development)

## Step 2: Environment Configuration

### 2.1 Backend Configuration
1. Navigate to the `backend` directory
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` file with your credentials:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000

   # WhatsApp Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   WEBHOOK_URL=https://your-domain.ngrok.io
   WEBHOOK_AUTH_TOKEN=your-webhook-secret-here
   ```

### 2.2 Install Dependencies
```bash
cd backend
npm install
```

The new dependencies for WhatsApp integration include:
- `twilio` - Twilio SDK for WhatsApp API
- `body-parser` - Parse webhook payloads
- `crypto` - Webhook signature verification

## Step 3: Webhook Setup

### 3.1 Install and Setup ngrok (Development)
1. Download and install [ngrok](https://ngrok.com/download)
2. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. In a new terminal, expose your local server:
   ```bash
   ngrok http 5000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 3.2 Configure Twilio Webhooks
1. Go to Twilio Console > Messaging > Settings > WhatsApp Sandbox Settings
2. Set the webhook URL for incoming messages:
   ```
   https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
   ```
3. Set the webhook URL for status updates:
   ```
   https://your-ngrok-url.ngrok.io/api/whatsapp/status
   ```
4. Set HTTP Method to `POST` for both

### 3.3 Webhook Security (Optional)
1. Generate a random webhook auth token:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add it to your `.env` file as `WEBHOOK_AUTH_TOKEN`
3. Configure the same token in Twilio webhook settings

## Step 4: Testing the Integration

### 4.1 Start the Application
```bash
cd backend
npm run dev
```

### 4.2 Test WhatsApp Messaging
1. Send a message to your Twilio WhatsApp sandbox number
2. The bot should respond with a welcome message
3. Try product searches like:
   - "I need a wireless mouse"
   - "Show me headphones under $100"
   - "Help"

### 4.3 Monitor Logs
- Check your terminal for incoming webhook events
- Monitor message delivery status
- Check for any errors in the logs

## Step 5: Available Features

### 5.1 Message Types Supported
- ✅ Text messages
- ✅ Media messages (images, documents) with captions
- ✅ Message delivery status tracking
- ✅ Conversation history management
- ✅ Typing indicators (simulated)

### 5.2 Bot Commands
- `help` - Show available commands
- `start over` / `restart` - Reset conversation
- Product searches using natural language
- Price-based queries ("under $50")
- Category-based searches ("gaming accessories")

### 5.3 API Endpoints
- `GET /api/whatsapp/health` - Health check
- `GET /api/whatsapp/conversation/:phoneNumber` - Get conversation history
- `DELETE /api/whatsapp/conversation/:phoneNumber` - Clear conversation
- `GET /api/whatsapp/stats/:phoneNumber?` - Message delivery statistics

## Step 6: Production Deployment

### 6.1 WhatsApp Business API (Production)
For production use, you need to:
1. Apply for WhatsApp Business API access
2. Get your WhatsApp Business Account verified
3. Set up a production webhook URL (not ngrok)
4. Update Twilio configuration with production numbers

### 6.2 Deployment Checklist
- [ ] Set up production server (Railway, Vercel, AWS, etc.)
- [ ] Configure production environment variables
- [ ] Set up production webhook URLs
- [ ] Test message delivery and status tracking
- [ ] Set up monitoring and error tracking
- [ ] Configure rate limiting and security measures

### 6.3 Recommended Production Stack
- **Server**: Railway, Vercel, or AWS Lambda
- **Database**: MongoDB or PostgreSQL (replace in-memory storage)
- **Cache**: Redis (for session management)
- **Monitoring**: Sentry or LogRocket
- **Analytics**: Custom dashboard or third-party service

## Step 7: Troubleshooting

### 7.1 Common Issues

**Webhook not receiving messages:**
- Check ngrok is running and URL is correct
- Verify webhook URL in Twilio console
- Check firewall settings
- Ensure server is running on correct port

**Messages not sending:**
- Verify Twilio credentials in `.env`
- Check account balance (for paid accounts)
- Verify WhatsApp sandbox setup
- Check error logs for specific error messages

**OpenAI API errors:**
- Verify API key is correct
- Check account credits/billing
- Monitor rate limits
- Check API endpoint availability

### 7.2 Debug Commands
```bash
# Check webhook health
curl https://your-ngrok-url.ngrok.io/api/whatsapp/health

# View conversation history
curl https://your-ngrok-url.ngrok.io/api/whatsapp/conversation/+1234567890

# Check message stats
curl https://your-ngrok-url.ngrok.io/api/whatsapp/stats
```

### 7.3 Logging
The application logs:
- Incoming webhook events
- Message processing steps
- AI response generation
- Message delivery status
- Error conditions

## Step 8: Customization

### 8.1 Modify Bot Responses
Edit `backend/services/openaiService.js` to:
- Change the system prompt
- Modify product recommendation format
- Adjust response length and style
- Add new conversation features

### 8.2 Add New Products
Update `backend/data/products.csv` with:
- New product entries
- Product images
- Updated categories
- Pricing information

### 8.3 Customize WhatsApp Formatting
Modify `backend/utils/whatsappFormatter.js` to:
- Change emoji usage
- Adjust message formatting
- Modify product card layout
- Update error messages

## Security Considerations

1. **Webhook Security**: Always verify webhook signatures
2. **Rate Limiting**: Implement rate limits to prevent abuse
3. **Data Privacy**: Handle phone numbers and conversations securely
4. **API Keys**: Never expose API keys in client-side code
5. **Input Validation**: Validate all incoming messages and data

## Cost Estimation

### Development (Free Tier)
- Twilio WhatsApp Sandbox: Free
- OpenAI API: ~$0.002 per conversation
- ngrok: Free (with limitations)

### Production Costs (Monthly)
- Twilio WhatsApp Business API: $0.005-0.009 per message
- OpenAI API: ~$10-50 depending on usage
- Server hosting: $5-20 (Railway/Vercel)
- **Estimated total**: $20-100 for 1000-5000 active users

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Twilio WhatsApp documentation
3. Check OpenAI API documentation
4. Create an issue in the project repository

## Next Steps

After basic setup:
1. [ ] Implement user authentication (if needed)
2. [ ] Add product catalog management
3. [ ] Set up analytics and monitoring
4. [ ] Implement advanced features (order tracking, payments, etc.)
5. [ ] Scale for production traffic