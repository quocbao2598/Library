#!/bin/bash

# Remote Deployment Script for GitHub Actions Built Images
# Usage: ./deploy-remote.sh [version]

set -e  # Exit on any error

# Configuration
DOCKER_IMAGE="baoquoc/library-management"
COMPOSE_FILE="docker-compose.remote.yml"
HEALTH_CHECK_URL="http://localhost:8080/actuator/health"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get version parameter
VERSION=${1:-latest}
IMAGE_TAG="${DOCKER_IMAGE}:${VERSION}"

log_info "🚀 Deploying ${IMAGE_TAG} from Docker Hub"

# Pull latest image
log_info "📥 Pulling latest image..."
docker pull "$IMAGE_TAG"

# Update image in compose file
log_info "📝 Updating compose file..."
sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${IMAGE_TAG}|g" "$COMPOSE_FILE"

# Deploy
log_info "🔄 Starting deployment..."
docker-compose -f "$COMPOSE_FILE" down
docker-compose -f "$COMPOSE_FILE" up -d

# Health check
log_info "⏳ Waiting for application..."
for i in {1..30}; do
    if curl -f -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
        log_success "✅ Application is healthy!"
        break
    fi
    echo "Attempt $i/30..."
    sleep 10
done

log_success "🎉 Deployment completed!"
echo "📱 App: http://localhost:8080"
echo "📊 Kibana: http://localhost:5601"
