#!/bin/bash

# CRM Application Startup Script
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print welcome banner
echo "
┌─────────────────────────────────────┐
│         CRM Application             │
│      Sales Pipeline Manager        │
└─────────────────────────────────────┘
"

print_info "Starting CRM application..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

print_success "Node.js found: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

print_success "npm found: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
else
    print_info "Dependencies already installed"
fi

# Check environment variables
print_info "Checking environment setup..."

if [ -z "$DATABASE_URL" ] && [ -z "$PGHOST" ]; then
    print_warning "Database environment variables not set. Using in-memory storage."
else
    print_success "Database configuration found"
fi

# Start the application
print_info "Starting development server..."
print_info "The application will be available at: http://localhost:5000"
print_info "Press Ctrl+C to stop the application"

echo ""
print_success "🚀 Launching CRM Application..."
echo ""

# Start the dev server
npm run dev