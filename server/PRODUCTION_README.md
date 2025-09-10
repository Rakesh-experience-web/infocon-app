# INFOCON API Gateway - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the INFOCON API Gateway in a production environment. The application is designed to handle SQL queries on survey datasets with enterprise-level security, performance, and reliability.

## Features

- **Production-Ready SQL Engine**: Advanced SQL query execution with security validation
- **File Processing**: Support for CSV and Excel file uploads
- **API Gateway**: RESTful API with rate limiting and security measures
- **Data Export**: Multiple export formats (JSON, CSV)
- **Query History**: Comprehensive query logging and history tracking
- **Health Monitoring**: Built-in health checks and monitoring
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Security**: Helmet.js, CORS, rate limiting, and input validation

## Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB available space
- **CPU**: 2+ cores recommended

### Software Requirements

- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Node.js**: Version 18+ (for development)
- **Git**: For version control

### Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS
brew install --cask docker

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd infocon-api-gateway
```

### 2. Configure Environment

```bash
# Copy environment configuration
cp env.example .env

# Edit configuration
nano .env
```

### 3. Deploy

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production
```

## Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_PATH=./data/api_gateway.db

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# JWT Configuration (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

### Security Considerations

1. **Change Default Secrets**: Update all default passwords and secrets
2. **Use HTTPS**: Configure SSL/TLS certificates for production
3. **Network Security**: Configure firewalls and network access
4. **Database Security**: Use encrypted database connections
5. **File Upload Security**: Validate and sanitize all uploaded files

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Start with additional services
docker-compose --profile with-redis --profile with-nginx up -d

# View logs
docker-compose logs -f api-gateway

# Stop services
docker-compose down
```

### Option 2: Manual Deployment

```bash
# Install dependencies
npm ci --only=production

# Start the application
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start src/server.js --name "infocon-api"
pm2 save
pm2 startup
```

### Option 3: Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: infocon-api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: infocon-api-gateway
  template:
    metadata:
      labels:
        app: infocon-api-gateway
    spec:
      containers:
      - name: api-gateway
        image: infocon-api-gateway:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## API Endpoints

### Health Check
```
GET /health
```

### Dataset Management
```
POST   /api/datasets/upload     # Upload dataset
GET    /api/datasets            # List datasets
GET    /api/datasets/:id        # Get dataset details
DELETE /api/datasets/:id        # Delete dataset
```

### Query Execution
```
POST   /api/datasets/:id/query  # Execute SQL query
GET    /api/datasets/:id/stats  # Get dataset statistics
GET    /api/datasets/:id/history # Get query history
```

### Data Export
```
GET    /api/datasets/:id/export # Export data (JSON/CSV)
```

## Monitoring and Logging

### Health Monitoring

The application provides built-in health monitoring:

```bash
# Check health status
curl http://localhost:5000/health

# Response example:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

### Logging

Logs are stored in `./logs/app.log` with different levels:

- **INFO**: General application events
- **WARN**: Warning messages
- **ERROR**: Error messages
- **DEBUG**: Debug information (development only)

### Monitoring with External Tools

#### Prometheus Metrics

```javascript
// Add to server.js for Prometheus metrics
const prometheus = require('prom-client');
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

#### Grafana Dashboard

Create a Grafana dashboard to monitor:
- Request rate and response times
- Error rates
- Database performance
- File upload statistics

## Backup and Recovery

### Database Backup

```bash
# Manual backup
cp ./data/api_gateway.db ./backups/backup_$(date +%Y%m%d_%H%M%S).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp ./data/api_gateway.db "$BACKUP_DIR/backup_$DATE.db"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "backup_*.db" -mtime +7 -delete
```

### File Upload Backup

```bash
# Backup uploaded files
tar -czf ./backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz ./uploads/
```

### Recovery

```bash
# Restore database
cp ./backups/backup_YYYYMMDD_HHMMSS.db ./data/api_gateway.db

# Restore files
tar -xzf ./backups/uploads_YYYYMMDD_HHMMSS.tar.gz
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_datasets_created_at ON datasets(created_at);
CREATE INDEX idx_queries_dataset_id ON queries(dataset_id);
CREATE INDEX idx_queries_created_at ON queries(created_at);

-- Optimize SQLite settings
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

### Application Optimization

1. **Enable Compression**: Already configured with compression middleware
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Connection Pooling**: Use connection pooling for database connections
4. **File Streaming**: Stream large files instead of loading into memory

### Load Balancing

For high-traffic deployments, use a load balancer:

```nginx
# nginx.conf
upstream api_servers {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Hardening

### SSL/TLS Configuration

```javascript
// Add to server.js for HTTPS
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.crt')
};

https.createServer(options, app).listen(443);
```

### Security Headers

The application uses Helmet.js for security headers:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

### Input Validation

All inputs are validated using express-validator:

```javascript
// Example validation
const { body, validationResult } = require('express-validator');

const validateQuery = [
  body('query').isString().isLength({ min: 1, max: 10000 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Locked**
   ```bash
   # Check for database locks
   sqlite3 ./data/api_gateway.db "PRAGMA busy_timeout = 30000;"
   ```

3. **File Upload Failures**
   ```bash
   # Check disk space
   df -h
   
   # Check file permissions
   ls -la ./uploads/
   ```

4. **Memory Issues**
   ```bash
   # Monitor memory usage
   docker stats infocon-api-gateway
   
   # Increase memory limits in docker-compose.yml
   ```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set environment variable
export NODE_ENV=development
export LOG_LEVEL=debug

# Restart the application
docker-compose restart api-gateway
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Database Maintenance**
   ```sql
   -- Run weekly
   VACUUM;
   ANALYZE;
   ```

2. **Log Rotation**
   ```bash
   # Add to crontab
   0 0 * * 0 logrotate /etc/logrotate.d/infocon-api
   ```

3. **Backup Verification**
   ```bash
   # Test backup restoration
   sqlite3 backup_test.db ".restore backup_file.db"
   ```

### Updates and Upgrades

1. **Application Updates**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Rebuild and redeploy
   ./deploy.sh production
   ```

2. **Dependency Updates**
   ```bash
   # Update dependencies
   npm audit fix
   npm update
   
   # Test and redeploy
   npm test
   ./deploy.sh production
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Contact

For support and questions:
- Email: support@infocon.com
- Documentation: https://docs.infocon.com
- Issues: https://github.com/infocon/api-gateway/issues
