#!/bin/bash

echo "🚀 Setting up AI Product Recommendation Chatbot..."

# Setup backend
echo "📦 Setting up backend..."
cd backend
npm install
cp .env.example .env
echo "✅ Backend setup complete!"

# Setup frontend
echo "🎨 Setting up frontend..."
cd ../frontend
npm install
echo "✅ Frontend setup complete!"

cd ..
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to backend/.env"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Visit http://localhost:3000"
echo ""
echo "Enjoy your AI chatbot! 🤖"