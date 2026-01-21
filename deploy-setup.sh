#!/bin/bash

echo "🏸 Badminton Liga - Vercel Deployment Setup"
echo "==========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and change the JWT_SECRET before deploying!"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
else
    echo "✅ Vercel CLI is installed"
    echo ""
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo ""
    echo "Please login with:"
    echo "  vercel login"
    echo ""
    exit 1
else
    VERCEL_USER=$(vercel whoami)
    echo "✅ Logged in as: $VERCEL_USER"
    echo ""
fi

echo "🚀 Ready to deploy!"
echo ""
echo "Next steps:"
echo "  1. Edit .env and set a secure JWT_SECRET"
echo "  2. Run: vercel"
echo "  3. Follow the prompts"
echo "  4. Your app will be deployed!"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""
