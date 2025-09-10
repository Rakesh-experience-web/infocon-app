const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    const healthUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const url = `${healthUrl}/health`;
    
    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Dataset Management
  async uploadDataset(file, name) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    return this.makeRequest('/datasets/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async listDatasets(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return this.makeRequest(`/datasets?${params.toString()}`, { method: 'GET' });
  }

  async getDataset(id) {
    return this.makeRequest(`/datasets/${id}`, { method: 'GET' });
  }

  async deleteDataset(id) {
    return this.makeRequest(`/datasets/${id}`, { method: 'DELETE' });
  }

  // SQL Query Execution
  async executeQuery(datasetId, query) {
    return this.makeRequest(`/datasets/${datasetId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Dataset Statistics
  async getDatasetStats(datasetId) {
    return this.makeRequest(`/datasets/${datasetId}/stats`, { method: 'GET' });
  }

  // Query History
  async getQueryHistory(datasetId, limit = 50) {
    const params = new URLSearchParams({ limit: limit.toString() });
    return this.makeRequest(`/datasets/${datasetId}/history?${params.toString()}`, { method: 'GET' });
  }

  // Data Export
  async exportData(datasetId, format = 'json', query = null) {
    const params = new URLSearchParams({ format });
    if (query) {
      params.append('query', query);
    }

    const url = `${this.baseURL}/datasets/${datasetId}/export?${params.toString()}`;
    
    try {
      const response = await fetch(url, { method: 'GET' });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (format === 'json') {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Download file
  async downloadFile(datasetId, format = 'json', query = null, filename = null) {
    const params = new URLSearchParams({ format });
    if (query) {
      params.append('query', query);
    }

    const url = `${this.baseURL}/datasets/${datasetId}/export?${params.toString()}`;
    
    try {
      const response = await fetch(url, { method: 'GET' });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || `dataset_${datasetId}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
