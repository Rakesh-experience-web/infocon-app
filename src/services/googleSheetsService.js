// Google Sheets API service
// Note: This requires Google Sheets API to be enabled and proper authentication
// For demo purposes, we'll create a mock service that can be replaced with real API calls

export class GoogleSheetsService {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  // Mock data for demonstration - replace with actual API calls
  async fetchSheetData(spreadsheetId, sheetName = null) {
    // This is a mock implementation
    // In a real application, you would use the Google Sheets API
    
    // Validate spreadsheet ID
    if (!this.validateSpreadsheetId(spreadsheetId)) {
      throw new Error('Invalid spreadsheet ID format');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data structure - return just the data array for compatibility
    const mockData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, department: 'Marketing' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, department: 'Engineering' },
      { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 32, department: 'HR' },
      { id: 6, name: 'Diana Davis', email: 'diana@example.com', age: 29, department: 'Finance' },
      { id: 7, name: 'Edward Miller', email: 'edward@example.com', age: 31, department: 'Operations' },
      { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', age: 27, department: 'Engineering' },
    ];

    // Return just the data array to match what the component expects
    return mockData;
  }

  // Real implementation would look like this:
  /*
  async fetchSheetData(spreadsheetId, sheetName = null) {
    try {
      const range = sheetName ? `${sheetName}!A:Z` : 'A:Z';
      const url = `${this.baseUrl}/${spreadsheetId}/values/${range}?key=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length === 0) {
        throw new Error('No data found in the specified range');
      }
      
      const headers = data.values[0];
      const rows = data.values.slice(1);
      
      const processedData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
      
      return {
        data: processedData,
        columns: headers,
        tableName: sheetName || 'Sheet1'
      };
    } catch (error) {
      throw new Error(`Failed to fetch Google Sheets data: ${error.message}`);
    }
  }
  */

  // Validate spreadsheet ID format
  validateSpreadsheetId(spreadsheetId) {
    // Google Sheets ID is typically 44 characters long and contains letters, numbers, and hyphens
    const pattern = /^[a-zA-Z0-9-_]{20,}$/;
    return pattern.test(spreadsheetId);
  }

  // Extract spreadsheet ID from URL
  extractSpreadsheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();
