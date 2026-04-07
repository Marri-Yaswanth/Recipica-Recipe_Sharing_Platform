#!/bin/bash

# Recipe Platform Combined - Setup Script
# This script automates the setup process for the combined recipe platform

echo "🍳 Recipe Platform Combined - Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ MySQL is installed"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Setup .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo ""
    echo "📝 You need to configure:"
    echo "   - Database credentials (DB_USER, DB_PASSWORD)"
    echo "   - JWT secret key (JWT_SECRET)"
    echo "   - Email credentials (EMAIL_USER, EMAIL_PASSWORD)"
    echo ""
    echo "   Run: nano .env"
else
    echo "✅ .env file already exists"
fi

# Prompt for database setup
echo ""
read -p "Do you want to setup the MySQL database now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🗄️  Setting up database..."
    echo "Please enter your MySQL root password when prompted:"
    
    # Create database
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS recipe_platform;"
    
    # Import schema
    mysql -u root -p recipe_platform < database.sql
    
    echo "✅ Database setup complete!"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit .env file with your configuration: nano .env"
echo "   2. Start the development servers:"
echo "      - Run both: npm run concurrently"
echo "      - Or separately:"
echo "        Terminal 1: npm run dev (backend)"
echo "        Terminal 2: cd client && npm start (frontend)"
echo ""
echo "   3. Access the application:"
echo "      - Frontend: http://localhost:3000"
echo "      - Backend API: http://localhost:5000"
echo ""
echo "Happy cooking! 🍳"
