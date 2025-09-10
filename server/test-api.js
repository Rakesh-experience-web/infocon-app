const fs = require('fs');
const path = require('path');

// Test data
const testData = `Name,Age,City,Salary
John Doe,30,New York,75000
Jane Smith,25,Los Angeles,65000
Mike Johnson,35,Chicago,80000
Sarah Wilson,28,Boston,70000
David Brown,32,Seattle,85000`;

// Create test CSV file
const testFilePath = path.join(__dirname, 'test-survey-data.csv');
fs.writeFileSync(testFilePath, testData);

console.log('✅ Test CSV file created:', testFilePath);
console.log('📊 Test data preview:');
console.log(testData);
console.log('\n🚀 API Gateway is ready for testing!');
console.log('\n📋 Available endpoints:');
console.log('  GET  http://localhost:5000/health');
console.log('  GET  http://localhost:5000/api');
console.log('  POST http://localhost:5000/api/datasets/upload');
console.log('  GET  http://localhost:5000/api/datasets');
console.log('  POST http://localhost:5000/api/datasets/1/query');
console.log('\n💡 Test commands:');
console.log('  curl http://localhost:5000/health');
console.log('  curl -X POST http://localhost:5000/api/datasets/upload -F "file=@test-survey-data.csv" -F "name=Test Survey"');
console.log('  curl -X POST http://localhost:5000/api/datasets/1/query -H "Content-Type: application/json" -d "{\\"query\\": \\"SELECT * FROM data LIMIT 3\\"}"');
