# API Gateway Integration Guide

This document provides a comprehensive guide for integrating the API Gateway with the frontend application.

## 🚀 Quick Start

### 1. Start the API Gateway Server

```bash
cd server
npm install
npm start
```

The API Gateway will be available at `http://localhost:5000`

### 2. Configure Frontend Environment

Create a `.env` file in the React app root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### 3. Start the Frontend Application

```bash
npm install
npm start
```

The React app will be available at `http://localhost:3000`

## 📋 Available Pages

### API Guide Page (`/api-guide`)
- **Purpose**: Documentation and integration guide
- **Features**:
  - API health status monitoring
  - Available datasets overview
  - Integration steps and examples
  - API endpoint documentation
  - Code examples

### API Integration Page (`/api-integration`)
- **Purpose**: Interactive API testing and dataset management
- **Features**:
  - File upload with progress tracking
  - Dataset listing and selection
  - SQL query execution
  - Real-time query results
  - Data export functionality
  - API health monitoring

## 🔧 API Service Methods

The `apiService` provides the following methods:

### Health Check
```javascript
const health = await apiService.checkHealth();
```

### Dataset Management
```javascript
// Upload dataset
const uploadResult = await apiService.uploadDataset(file, name);

// List datasets
const datasets = await apiService.listDatasets();

// Get specific dataset
const dataset = await apiService.getDataset(id);

// Delete dataset
await apiService.deleteDataset(id);
```

### Query Execution
```javascript
// Execute SQL query
const results = await apiService.executeQuery(datasetId, query);

// Get query history
const history = await apiService.getQueryHistory(datasetId);
```

### Data Export
```javascript
// Export data
const data = await apiService.exportData(datasetId, format);

// Download file
await apiService.downloadFile(datasetId, format, query, filename);
```

### Dataset Statistics
```javascript
// Get dataset statistics
const stats = await apiService.getDatasetStats(datasetId);
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/datasets/upload` | Upload dataset |
| GET | `/api/datasets` | List datasets |
| GET | `/api/datasets/:id` | Get dataset details |
| DELETE | `/api/datasets/:id` | Delete dataset |
| POST | `/api/datasets/:id/query` | Execute SQL query |
| GET | `/api/datasets/:id/stats` | Get dataset statistics |
| GET | `/api/datasets/:id/history` | Get query history |
| GET | `/api/datasets/:id/export` | Export data |

## 📊 Supported File Formats

- **CSV** (.csv)
- **Excel** (.xlsx, .xls)

## 🔒 Security Features

- File size validation (10MB limit)
- File type validation
- SQL injection protection
- Rate limiting
- CORS configuration
- Input sanitization

## 🐛 Troubleshooting

### Common Issues

1. **API Gateway not responding**
   - Check if server is running on port 5000
   - Verify firewall settings
   - Check server logs

2. **CORS errors**
   - Ensure CORS_ORIGIN is set to `http://localhost:3000`
   - Check browser console for specific errors

3. **File upload failures**
   - Verify file size is under 10MB
   - Check file format is supported
   - Ensure upload directory has write permissions

4. **Query execution errors**
   - Verify SQL syntax
   - Check dataset exists and is accessible
   - Review server logs for detailed error messages

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in the server environment.

## 📈 Performance Optimization

- Dataset caching for frequently accessed data
- Query result pagination
- File compression for large datasets
- Database indexing for better query performance

## 🔄 Development Workflow

1. **Local Development**
   ```bash
   # Terminal 1 - Start API Gateway
   cd server && npm run dev
   
   # Terminal 2 - Start Frontend
   npm start
   ```

2. **Testing**
   ```bash
   # Test API endpoints
   cd server && npm test
   
   # Test frontend components
   npm test
   ```

3. **Production Build**
   ```bash
   # Build frontend
   npm run build
   
   # Start production server
   cd server && npm start
   ```

## 📚 Additional Resources

- [API Gateway Documentation](./server/README.md)
- [Frontend Component Documentation](./src/components/)
- [Database Schema](./server/src/database/)
- [API Testing Examples](./server/test-api.js)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
