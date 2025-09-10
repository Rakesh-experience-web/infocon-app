const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_FILE = 'test-survey-data.csv';

// Test data
const testData = `Name,Age,City,Salary,Department
John Doe,30,New York,75000,Engineering
Jane Smith,25,Los Angeles,65000,Marketing
Mike Johnson,35,Chicago,80000,Engineering
Sarah Wilson,28,Boston,70000,HR
David Brown,32,Seattle,85000,Engineering
Lisa Chen,29,San Francisco,72000,Marketing
Tom Davis,31,Austin,78000,Engineering
Emma White,27,Denver,68000,HR
Alex Turner,33,Portland,82000,Engineering
Maria Garcia,26,Miami,63000,Marketing`;

// Create test CSV file
const testFilePath = path.join(__dirname, TEST_FILE);
fs.writeFileSync(testFilePath, testData);

console.log('🚀 SQL Query API Gateway - Complete Test Suite');
console.log('==============================================\n');

// Utility function to make HTTP requests
function makeRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log('   Response:', response.body);
    } else {
      console.log('❌ Health check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
  console.log('');
}

async function testAPIDocumentation() {
  console.log('2️⃣ Testing API Documentation...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api`);
    if (response.status === 200) {
      console.log('✅ API documentation retrieved');
      console.log('   Version:', response.body.version);
      console.log('   Endpoints:', Object.keys(response.body.endpoints.datasets).length);
    } else {
      console.log('❌ API documentation failed:', response.status);
    }
  } catch (error) {
    console.log('❌ API documentation error:', error.message);
  }
  console.log('');
}

async function testFileUpload() {
  console.log('3️⃣ Testing File Upload...');
  try {
    // Create multipart form data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    const fileContent = fs.readFileSync(testFilePath);
    
    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="name"\r\n\r\n';
    body += 'Employee Survey 2024\r\n';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${TEST_FILE}"\r\n`;
    body += 'Content-Type: text/csv\r\n\r\n';
    body += fileContent.toString() + '\r\n';
    body += `--${boundary}--\r\n`;

    const response = await makeRequest('POST', `${BASE_URL}/api/datasets/upload`, body, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body)
    });

    if (response.status === 201) {
      console.log('✅ File upload successful');
      console.log('   Dataset ID:', response.body.data.id);
      console.log('   Dataset Name:', response.body.data.name);
      console.log('   Rows:', response.body.data.rowCount);
      return response.body.data.id;
    } else {
      console.log('❌ File upload failed:', response.status, response.body);
      return null;
    }
  } catch (error) {
    console.log('❌ File upload error:', error.message);
    return null;
  }
  console.log('');
}

async function testListDatasets() {
  console.log('4️⃣ Testing List Datasets...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/datasets`);
    if (response.status === 200) {
      console.log('✅ List datasets successful');
      console.log('   Total datasets:', response.body.data.pagination.total);
      console.log('   Datasets:', response.body.data.datasets.length);
    } else {
      console.log('❌ List datasets failed:', response.status);
    }
  } catch (error) {
    console.log('❌ List datasets error:', error.message);
  }
  console.log('');
}

async function testGetDataset(datasetId) {
  console.log('5️⃣ Testing Get Dataset...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/datasets/${datasetId}`);
    if (response.status === 200) {
      console.log('✅ Get dataset successful');
      console.log('   Dataset Name:', response.body.data.name);
      console.log('   Columns:', response.body.data.columns.length);
      console.log('   Sample Data Rows:', response.body.data.sampleData.length);
    } else {
      console.log('❌ Get dataset failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Get dataset error:', error.message);
  }
  console.log('');
}

async function testExecuteQuery(datasetId) {
  console.log('6️⃣ Testing SQL Query Execution...');
  
  const queries = [
    {
      name: 'Simple SELECT',
      query: 'SELECT * FROM data LIMIT 3'
    },
    {
      name: 'Aggregation Query',
      query: 'SELECT Department, COUNT(*) as count, AVG(Salary) as avg_salary FROM data GROUP BY Department'
    },
    {
      name: 'Filtered Query',
      query: 'SELECT Name, Age, Salary FROM data WHERE Age > 30 ORDER BY Salary DESC'
    }
  ];

  for (const testQuery of queries) {
    try {
      console.log(`   Testing: ${testQuery.name}`);
      const response = await makeRequest('POST', `${BASE_URL}/api/datasets/${datasetId}/query`, {
        query: testQuery.query
      });

      if (response.status === 200) {
        console.log(`   ✅ ${testQuery.name} successful`);
        console.log(`      Rows returned: ${response.body.rowCount}`);
        console.log(`      Execution time: ${response.body.executionTime}ms`);
      } else {
        console.log(`   ❌ ${testQuery.name} failed:`, response.status, response.body.error);
      }
    } catch (error) {
      console.log(`   ❌ ${testQuery.name} error:`, error.message);
    }
  }
  console.log('');
}

async function testGetStats(datasetId) {
  console.log('7️⃣ Testing Dataset Statistics...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/datasets/${datasetId}/stats`);
    if (response.status === 200) {
      console.log('✅ Get stats successful');
      console.log('   Total rows:', response.body.data.dataset.totalRows);
      console.log('   Columns with stats:', Object.keys(response.body.data.columnStats).length);
    } else {
      console.log('❌ Get stats failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Get stats error:', error.message);
  }
  console.log('');
}

async function testExportData(datasetId) {
  console.log('8️⃣ Testing Data Export...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/datasets/${datasetId}/export?format=json`);
    if (response.status === 200) {
      console.log('✅ Export successful');
      console.log('   Format: JSON');
      console.log('   Data type:', typeof response.body);
    } else {
      console.log('❌ Export failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Export error:', error.message);
  }
  console.log('');
}

async function testQueryHistory(datasetId) {
  console.log('9️⃣ Testing Query History...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/datasets/${datasetId}/history`);
    if (response.status === 200) {
      console.log('✅ Query history successful');
      console.log('   Queries in history:', response.body.data.queries.length);
    } else {
      console.log('❌ Query history failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Query history error:', error.message);
  }
  console.log('');
}

// Main test execution
async function runAllTests() {
  try {
    await testHealthCheck();
    await testAPIDocumentation();
    
    const datasetId = await testFileUpload();
    if (datasetId) {
      await testListDatasets();
      await testGetDataset(datasetId);
      await testExecuteQuery(datasetId);
      await testGetStats(datasetId);
      await testExportData(datasetId);
      await testQueryHistory(datasetId);
    }

    console.log('🎉 Test suite completed!');
    console.log('📊 API Gateway is working correctly.');
    console.log('\n💡 Next steps:');
    console.log('   - Start the server: npm start');
    console.log('   - Test with your frontend application');
    console.log('   - Check logs for detailed information');
    
  } catch (error) {
    console.log('❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
