#!/bin/bash
# CampusFund API Server Setup Script
# Run this on your cPanel server via SSH or Terminal

echo "=== CampusFund API Setup ==="

# Navigate to the API directory
cd "$(dirname "$0")"

# 1. Install Composer dependencies
echo "[1/4] Installing Composer dependencies..."
if command -v composer &> /dev/null; then
    composer install --no-dev --optimize-autoloader 2>&1
    echo "✓ Composer dependencies installed"
else
    echo "✗ Composer not found. Installing..."
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php
    php composer.phar install --no-dev --optimize-autoloader 2>&1
    rm composer-setup.php
    echo "✓ Composer dependencies installed via composer.phar"
fi

# 2. Check .env file
echo "[2/4] Checking .env configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠ .env created from .env.example - UPDATE WITH REAL VALUES!"
    else
        echo "✗ No .env file found. Create one manually."
    fi
else
    echo "✓ .env file exists"
fi

# 3. Set permissions
echo "[3/4] Setting permissions..."
chmod 755 app/
chmod 755 public/
chmod 644 public/index.php
chmod 755 uploads/
chmod 755 uploads/campaigns/
chmod 755 uploads/requests/
echo "✓ Permissions set"

# 4. Test
echo "[4/4] Testing API..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/auth/login 2>/dev/null || echo "N/A")
echo "API test HTTP code: $HTTP_CODE"

echo ""
echo "=== Setup Complete ==="
echo "IMPORTANT: Edit .env with your real database credentials, JWT secret, and mail settings."
echo "Then import database/campus_fund.sql into your MySQL database."
