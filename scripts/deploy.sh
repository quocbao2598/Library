#!/bin/bash

# 🚀 Production Deployment Script for Library Management System

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before running again."
        exit 1
    fi
    print_success ".env file found"
}

# Pull latest images
pull_images() {
    print_status "Pulling latest Docker images..."
    source .env
    
    if [ -z "$DOCKER_IMAGE" ]; then
        print_error "DOCKER_IMAGE not set in .env file"
        exit 1
    fi
    
    docker pull $DOCKER_IMAGE
    docker pull postgres:15
    print_success "Images pulled successfully"
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    print_success "Containers stopped"
}

# Start new containers
start_containers() {
    print_status "Starting containers..."
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Containers started"
}

# Wait for application to be healthy
wait_for_health() {
    print_status "Waiting for application to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
            print_success "Application is healthy!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for application..."
        sleep 10
        ((attempt++))
    done
    
    print_error "Application failed to become healthy within 5 minutes"
    return 1
}

# Show status
show_status() {
    print_status "Current container status:"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    print_status "Application URLs:"
    echo "🌐 Application: http://localhost:8080"
    echo "❤️  Health Check: http://localhost:8080/actuator/health"
    echo "📊 Metrics: http://localhost:8080/actuator/metrics"
    
    echo ""
    print_status "Useful commands:"
    echo "📋 View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🔄 Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "🛑 Stop: docker-compose -f docker-compose.prod.yml down"
}

# Main deployment function
deploy() {
    echo "🚀 Starting Library Management System Deployment"
    echo "================================================"
    
    check_docker
    check_env_file
    pull_images
    stop_containers
    start_containers
    
    if wait_for_health; then
        show_status
        print_success "🎉 Deployment completed successfully!"
    else
        print_error "💥 Deployment failed - application is not healthy"
        print_status "Showing container logs:"
        docker-compose -f docker-compose.prod.yml logs --tail=50 library-app
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        print_status "Restarting application..."
        docker-compose -f docker-compose.prod.yml restart library-app
        wait_for_health && print_success "Application restarted successfully!"
        ;;
    "clean")
        print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            docker-compose -f docker-compose.prod.yml down -v
            print_success "Cleaned up successfully"
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|status|logs|stop|restart|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (default)"
        echo "  status  - Show current status"
        echo "  logs    - Follow application logs"
        echo "  stop    - Stop all containers"
        echo "  restart - Restart application container"
        echo "  clean   - Remove all containers and volumes"
        exit 1
        ;;
esac
