#!/bin/bash

set -e

# Determine which docker compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="sudo docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="sudo docker compose"
else
    DOCKER_COMPOSE="sudo docker-compose"
fi

# Determine if sudo is needed for Docker
SUDO=""
if ! docker info &> /dev/null; then
    if sudo docker info &> /dev/null; then
        SUDO="sudo"
        echo "⚠️  Docker requires sudo - using sudo for docker commands"
    else
        echo "❌ Cannot access Docker (tried without and with sudo)"
        echo ""
        echo "Fix options:"
        echo "  1. Add your user to the docker group:"
        echo "     sudo usermod -aG docker $USER"
        echo "     Then log out and log back in"
        echo ""
        echo "  2. Run this script with sudo:"
        echo "     sudo ./deploy.sh"
        exit 1
    fi
fi

echo "🚀 Cloudflare Demos Deployment"
echo "======================================"
echo ""

# Validate modules
echo "🔍 Validating modules..."
if [ ! -f "./scripts/validate-modules.sh" ]; then
    echo "❌ validate-modules.sh not found"
    exit 1
fi

./scripts/validate-modules.sh

# Build nginx configs from modules
echo "🔨 Building nginx configuration..."
if [ ! -f "./scripts/build-nginx.sh" ]; then
    echo "❌ build-nginx.sh not found"
    exit 1
fi

./scripts/build-nginx.sh

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

if ! $SUDO docker info &> /dev/null; then
    echo "❌ Docker not installed or not accessible"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi
echo "  ✓ Docker found"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not installed"
    echo "   Install from: https://docs.docker.com/compose/install/"
    exit 1
fi
echo "  ✓ Docker Compose found"

# Check .env
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "   Create .env with your TUNNEL_TOKEN"
    exit 1
fi

# Pull latest changes from GitHub
echo ""
echo "🔄 Pulling latest changes from GitHub..."
if ! git pull &> /dev/null; then
    echo "⚠️  Git pull encountered issues (continuing anyway)"
else
    echo "  ✓ Latest code pulled"
fi
echo ""

source .env

if [ -z "$TUNNEL_TOKEN" ]; then
    echo "❌ TUNNEL_TOKEN not set in .env"
    exit 1
fi
echo "  ✓ TUNNEL_TOKEN configured"

# Deploy
echo ""
echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE down 2>/dev/null || true

echo "🔨 Building containers..."
$DOCKER_COMPOSE build --no-cache

echo "🚀 Starting services..."
$DOCKER_COMPOSE up -d

# Wait
echo "⏳ Waiting for services to start..."
sleep 5

# Check status
echo ""
echo "🔍 Checking service status..."

if $SUDO docker ps | grep -q "cf-demos-nginx"; then
    echo "  ✓ Nginx running"
else
    echo "  ❌ Nginx failed"
    $DOCKER_COMPOSE logs nginx
    exit 1
fi

if $SUDO docker ps | grep -q "cf-demos-tunnel"; then
    echo "  ✓ Tunnel running"
else
    echo "  ❌ Tunnel failed"
    $DOCKER_COMPOSE logs cloudflared
    exit 1
fi

# Health check
echo ""
echo "🏥 Running health check..."
if curl -s http://localhost:80/health > /dev/null; then
    echo "  ✓ Health check passed"
else
    echo "  ⚠️  Health check failed (but service may still be starting)"
fi

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Active Modules:"
for module_dir in modules/*/; do
    module_name=$(basename "$module_dir")
    if [[ "$module_name" != _* ]] && [[ "$module_name" != .* ]]; then
        config="$module_dir/config.json"
        if [ -f "$config" ]; then
            if command -v python3 &> /dev/null; then
                enabled=$(python3 -c "import json; print(json.load(open('$config')).get('enabled', False))" 2>/dev/null || echo "False")
                if [ "$enabled" = "True" ]; then
                    name=$(python3 -c "import json; print(json.load(open('$config')).get('name', '$module_name'))" 2>/dev/null || echo "$module_name")
                    icon=$(python3 -c "import json; print(json.load(open('$config')).get('icon', '📦'))" 2>/dev/null || echo "📦")
                    echo "  ✓ $icon $name ($module_name)"
                fi
            else
                echo "  ? $module_name (install python3 for details)"
            fi
        fi
    fi
done
echo ""
echo "🌐 Cloudflare Tunnel: Running (check your Cloudflare dashboard for URL)"
echo "🔍 Local: http://localhost"
echo ""
echo "📝 To view logs:"
echo "   $DOCKER_COMPOSE logs -f"
echo ""
echo "🔄 To restart:"
echo "   $DOCKER_COMPOSE restart"
echo ""
echo "🛑 To stop:"
echo "   $DOCKER_COMPOSE down"
echo ""
