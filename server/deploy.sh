#!/bin/bash

# Production Deployment Script for INFOCON API Gateway
# Usage: ./deploy.sh [environment]

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="infocon-api-gateway"
DOCKER_IMAGE="infocon-api-gateway:latest"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p data uploads logs backups ssl
    success "Directories created successfully"
}

# Backup existing data
backup_data() {
    if [ -f "./data/api_gateway.db" ]; then
        log "Creating backup of existing database..."
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).db"
        cp ./data/api_gateway.db "$BACKUP_FILE"
        success "Database backed up to $BACKUP_FILE"
    else
        warning "No existing database found, skipping backup"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        warning ".env file not found. Creating from example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            warning "Please update .env file with your configuration before continuing"
        else
            error "env.example file not found"
        fi
    fi
    
    success "Prerequisites check completed"
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    docker build -t "$DOCKER_IMAGE" . || error "Failed to build Docker image"
    success "Docker image built successfully"
}

# Stop existing containers
stop_containers() {
    log "Stopping existing containers..."
    docker-compose down --remove-orphans || warning "No existing containers to stop"
    success "Existing containers stopped"
}

# Start services
start_services() {
    log "Starting services..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose up -d api-gateway || error "Failed to start API gateway"
    else
        docker-compose up -d || error "Failed to start services"
    fi
    
    success "Services started successfully"
}

# Wait for service to be ready
wait_for_service() {
    log "Waiting for service to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5000/health > /dev/null 2>&1; then
            success "Service is ready"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Service not ready yet, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Service failed to start within expected time"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    # Check if container is running
    if ! docker ps | grep -q "$APP_NAME"; then
        error "Container is not running"
    fi
    
    # Check health endpoint
    if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
        error "Health check failed"
    fi
    
    success "Health checks passed"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo "=================="
    docker-compose ps
    echo ""
    echo "Health Check:"
    curl -s http://localhost:5000/health | jq . 2>/dev/null || curl -s http://localhost:5000/health
    echo ""
    echo "Logs:"
    docker-compose logs --tail=10 api-gateway
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups (keeping last 5)..."
    ls -t "$BACKUP_DIR"/backup_*.db 2>/dev/null | tail -n +6 | xargs -r rm
    success "Old backups cleaned up"
}

# Main deployment function
main() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    # Create log file
    mkdir -p logs
    touch "$LOG_FILE"
    
    # Run deployment steps
    create_directories
    check_prerequisites
    backup_data
    build_image
    stop_containers
    start_services
    wait_for_service
    health_check
    cleanup_backups
    
    success "Deployment completed successfully!"
    show_status
}

# Handle script arguments
case "$1" in
    "production"|"prod")
        ENVIRONMENT="production"
        main
        ;;
    "development"|"dev")
        ENVIRONMENT="development"
        main
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment]"
        echo "Environments:"
        echo "  production (default) - Deploy production environment"
        echo "  development         - Deploy development environment"
        echo "  help                - Show this help message"
        ;;
    "")
        main
        ;;
    *)
        error "Unknown environment: $1. Use 'help' for usage information."
        ;;
esac
