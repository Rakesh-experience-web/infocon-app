import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// SQL.js initialization with better error handling
let SQL = null;
let sqlInitialized = false;

// Initialize SQL.js with multiple fallback strategies
const initSQL = async () => {
  if (sqlInitialized && SQL) {
    return SQL;
  }

  try {
    console.log('Initializing SQL.js...');
    
    // Try to import sql.js dynamically
    const initSqlJs = await import('sql.js');
    
    // Try different initialization methods
    try {
      // Method 1: CDN initialization
      SQL = await initSqlJs.default({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      console.log('SQL.js initialized via CDN');
    } catch (cdnError) {
      console.log('CDN initialization failed, trying local initialization...');
      
      // Method 2: Local initialization
      SQL = await initSqlJs.default();
      console.log('SQL.js initialized locally');
    }
    
    sqlInitialized = true;
    console.log('SQL.js initialized successfully');
    return SQL;
  } catch (error) {
    console.error('Failed to initialize SQL.js:', error);
    
    // Fallback: Use a simple in-memory SQL implementation
    console.log('Using fallback SQL implementation');
    return createFallbackSQL();
  }
};

// Fallback SQL implementation for when SQL.js fails
const createFallbackSQL = () => {
  return {
    Database: class FallbackDatabase {
      constructor() {
        this.tables = new Map();
        this.preparedStatements = new Map();
      }

      run(sql) {
        const upperSQL = sql.toUpperCase();
        
        if (upperSQL.includes('CREATE TABLE')) {
          // Extract table name and columns
          const match = sql.match(/CREATE TABLE (\w+)\s*\(([^)]+)\)/i);
          if (match) {
            const tableName = match[1];
            const columns = match[2].split(',').map(col => col.trim().split(' ')[0]);
            this.tables.set(tableName, { columns, data: [] });
          }
        } else if (upperSQL.includes('INSERT INTO')) {
          // Extract table name and values
          const match = sql.match(/INSERT INTO (\w+) VALUES\s*\(([^)]+)\)/i);
          if (match) {
            const tableName = match[1];
            const values = match[2].split(',').map(v => v.trim().replace(/['"]/g, ''));
            const table = this.tables.get(tableName);
            if (table) {
              const row = {};
              table.columns.forEach((col, i) => {
                row[col] = values[i] || null;
              });
              table.data.push(row);
            }
          }
        }
      }

      prepare(sql) {
        const stmtId = Date.now();
        this.preparedStatements.set(stmtId, { sql, params: [] });
        return {
          run: (params) => {
            const stmt = this.preparedStatements.get(stmtId);
            if (stmt) {
              stmt.params = params;
              this.run(stmt.sql);
            }
          },
          free: () => {
            this.preparedStatements.delete(stmtId);
          }
        };
      }

      all(sql) {
        const upperSQL = sql.toUpperCase();
        
        if (upperSQL.includes('SELECT')) {
          // Extract table name
          const match = sql.match(/FROM (\w+)/i);
          if (match) {
            const tableName = match[1];
            const table = this.tables.get(tableName);
            if (table) {
              return table.data;
            }
          }
        }
        return [];
      }

      close() {
        this.tables.clear();
        this.preparedStatements.clear();
      }
    }
  };
};

// Process uploaded file
export const processFile = async (file) => {
  try {
    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    if (!file || file.size === 0) {
      throw new Error('File is empty or invalid');
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum size is 10MB.');
    }
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    console.log('File extension:', fileExtension);
    
    if (fileExtension === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          trimHeaders: true,
          trimValues: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }
            
            if (!results.data || results.data.length === 0) {
              reject(new Error('No data found in the CSV file'));
              return;
            }
            
            // Filter out completely empty rows
            const filteredData = results.data.filter(row => {
              return Object.values(row).some(value => 
                value !== '' && value !== null && value !== undefined
              );
            });
            
            if (filteredData.length === 0) {
              reject(new Error('No valid data rows found in the CSV file'));
              return;
            }
            
            console.log('CSV processing complete. Rows:', filteredData.length, 'Columns:', Object.keys(filteredData[0] || {}).length);
            resolve(filteredData);
          },
          error: (error) => {
            reject(new Error(`CSV parsing failed: ${error.message}`));
          }
        });
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      console.log('Processing Excel file...');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      console.log('Available sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      console.log('Processing sheet:', sheetName);
      
      // Use sheet_to_json with header: 1 to get array format, then convert to objects
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rawData.length === 0) {
        throw new Error('No data found in the Excel file');
      }
      
      // First row contains headers
      const headers = rawData[0];
      const rows = rawData.slice(1);
      
      // Convert to array of objects
      const processedData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          // Handle cases where row might be shorter than headers
          obj[header] = row[index] !== undefined ? row[index] : '';
        });
        return obj;
      }).filter(row => {
        // Filter out completely empty rows
        return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
      });
      
      if (processedData.length === 0) {
        throw new Error('No valid data rows found in the Excel file');
      }
      
      console.log('Excel processing complete. Rows:', processedData.length, 'Columns:', Object.keys(processedData[0] || {}).length);
      return processedData;
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.');
    }
  } catch (error) {
    console.error('File processing error:', error);
    
    // Try alternative method for Excel files if the first method fails
    if ((fileExtension === 'xlsx' || fileExtension === 'xls') && error.message.includes('No valid data')) {
      try {
        console.log('Trying alternative Excel processing method...');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Try direct conversion to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data && data.length > 0) {
          console.log('Alternative Excel processing successful. Rows:', data.length);
          return data;
        }
      } catch (altError) {
        console.error('Alternative Excel processing also failed:', altError);
      }
    }
    
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

// Convert data to SQL table with improved error handling
export const convertToSQLTable = async (data, tableName = 'data_table') => {
  try {
    const sql = await initSQL();
    console.log('SQL object initialized successfully');
    
    const db = new sql.Database();
    console.log('Created database instance');
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No valid data provided');
    }

    // Ensure all rows have the same structure
    const firstRow = data[0];
    if (!firstRow || typeof firstRow !== 'object') {
      throw new Error('Invalid data structure');
    }

    const columns = Object.keys(data[0]);
    console.log('Columns:', columns);
    
    // Determine column types with better logic
    const columnTypes = columns.map(col => {
      const sampleValue = data[0][col];
      if (sampleValue === null || sampleValue === undefined) {
        return 'TEXT';
      }
      if (typeof sampleValue === 'number' && !isNaN(sampleValue)) {
        return 'REAL';
      }
      if (typeof sampleValue === 'boolean') {
        return 'INTEGER';
      }
      return 'TEXT';
    });

    // Create table with proper column escaping
    const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns.map((col, i) => 
      `"${col}" ${columnTypes[i]}`
    ).join(', ')})`;
    
    console.log('Creating table with SQL:', createTableSQL);
    
    try {
      db.run(createTableSQL);
      console.log('Table created successfully');
    } catch (error) {
      console.error('Failed to create table:', error);
      throw new Error(`Failed to create SQL table: ${error.message}`);
    }

    // Insert data with better error handling
    const placeholders = columns.map(() => '?').join(',');
    const insertSQL = `INSERT INTO "${tableName}" VALUES (${placeholders})`;
    
    console.log('Inserting data with SQL:', insertSQL);
    
    try {
      const stmt = db.prepare(insertSQL);
      
      let insertedCount = 0;
      data.forEach((row, index) => {
        try {
          const values = columns.map(col => {
            const value = row[col];
            // Handle null/undefined values
            if (value === null || value === undefined) {
              return null;
            }
            // Convert to string for TEXT columns
            return String(value);
          });
          stmt.run(values);
          insertedCount++;
        } catch (rowError) {
          console.error(`Error inserting row ${index}:`, rowError);
          // Continue with other rows instead of failing completely
          console.warn(`Skipping row ${index} due to error: ${rowError.message}`);
        }
      });
      
      stmt.free();
      console.log(`Successfully inserted ${insertedCount} out of ${data.length} rows`);
    } catch (error) {
      console.error('Failed to insert data:', error);
      throw new Error(`Failed to insert data into SQL table: ${error.message}`);
    }
    
    return { db, tableName, columns };
  } catch (error) {
    console.error('Error in convertToSQLTable:', error);
    throw new Error(`Failed to convert data to SQL table: ${error.message}`);
  }
};

// Validate Excel file before processing
export const validateExcelFile = (file) => {
  const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xltx', '.xlt'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(fileExtension)) {
    throw new Error(`Unsupported file format: ${fileExtension}. Supported formats: ${validExtensions.join(', ')}`);
  }
  
  if (file.size === 0) {
    throw new Error('File is empty');
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('File size too large. Maximum size is 50MB');
  }
  
  return true;
};

// Process Excel file
export const processExcelFile = async (file) => {
  // Validate file first
  try {
    validateExcelFile(file);
  } catch (validationError) {
    return Promise.reject(validationError);
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        
        // Try different reading options for better compatibility
        let workbook;
        try {
          workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            cellNF: false,
            cellText: false,
            cellStyles: false
          });
        } catch (readError) {
          // Fallback to binary reading
          workbook = XLSX.read(data, { type: 'binary' });
        }
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('No sheets found in Excel file'));
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          reject(new Error(`Sheet "${sheetName}" not found or empty`));
          return;
        }
        
        // Try different parsing methods
        let jsonData;
        try {
          // Method 1: Try with headers
          jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          });
        } catch (parseError) {
          try {
            // Method 2: Try without headers
            jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 'A',
              defval: '',
              blankrows: false
            });
          } catch (parseError2) {
            // Method 3: Try raw parsing
            jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              raw: true,
              defval: '',
              blankrows: false
            });
          }
        }
        
        if (!jsonData || jsonData.length === 0) {
          reject(new Error('No data found in Excel sheet'));
          return;
        }
        
        // Handle different data structures
        let processedData;
        let headers;
        
        if (Array.isArray(jsonData)) {
          // Array format
          if (jsonData.length < 1) {
            reject(new Error('Excel file is empty'));
            return;
          }
          
          // Check if first row contains headers
          const firstRow = jsonData[0];
          if (Array.isArray(firstRow)) {
            // Array of arrays format
            headers = firstRow.map((header, index) => {
              if (header === null || header === undefined || header === '') {
                return `Column_${index + 1}`;
              }
              return String(header).trim();
            });
            
            const rows = jsonData.slice(1);
            processedData = rows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] !== undefined ? row[index] : '';
              });
              return obj;
            });
          } else {
            // Array of objects format
            headers = Object.keys(firstRow);
            processedData = jsonData;
          }
        } else {
          // Object format
          processedData = [jsonData];
          headers = Object.keys(jsonData);
        }
        
        // Clean and validate data
        processedData = processedData.filter(row => {
          if (!row || typeof row !== 'object') return false;
          return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
        });
        
        if (processedData.length === 0) {
          reject(new Error('No valid data rows found after processing'));
          return;
        }
        
        // Ensure all rows have the same structure
        const cleanHeaders = headers.filter(header => header && header.trim() !== '');
        if (cleanHeaders.length === 0) {
          reject(new Error('No valid column headers found'));
          return;
        }
        
        const finalData = processedData.map(row => {
          const cleanRow = {};
          cleanHeaders.forEach(header => {
            cleanRow[header] = row[header] !== undefined ? row[header] : '';
          });
          return cleanRow;
        });
        
        resolve({
          data: finalData,
          columns: cleanHeaders,
          tableName: sheetName.replace(/[^a-zA-Z0-9]/g, '_')
        });
        
      } catch (error) {
        console.error('Excel processing error:', error);
        reject(new Error(`Failed to process Excel file: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

// Fallback CSV processing method
export const processCSVFileFallback = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header row and one data row'));
          return;
        }
        
        // Try different delimiters
        const delimiters = [',', ';', '\t', '|', ' '];
        
        for (const delimiter of delimiters) {
          try {
            const headerLine = lines[0];
            const headers = headerLine.split(delimiter).map(h => h.trim().replace(/[^a-zA-Z0-9_]/g, '_'));
            
            if (headers.length > 1) {
              console.log('Fallback CSV processing with delimiter:', delimiter, 'headers:', headers);
              
              const data = [];
              for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(delimiter);
                const row = {};
                
                headers.forEach((header, index) => {
                  row[header] = values[index] ? values[index].trim() : '';
                });
                
                // Only add row if it has some non-empty values
                if (Object.values(row).some(val => val !== '')) {
                  data.push(row);
                }
              }
              
              if (data.length > 0) {
                const tableName = file.name.replace(/\.csv$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
                
                resolve({
                  data,
                  columns: headers,
                  tableName
                });
                return;
              }
            }
          } catch (delimiterError) {
            console.log('Delimiter', delimiter, 'failed:', delimiterError.message);
            continue;
          }
        }
        
        reject(new Error('Could not parse CSV with any known delimiter'));
        
      } catch (error) {
        reject(new Error('Fallback CSV processing failed: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

// Process CSV file
export const processCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    // First, try to detect the delimiter by reading a small sample
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sample = e.target.result.slice(0, 1000); // Read first 1000 characters
        
        // Detect delimiter
        const delimiters = [',', ';', '\t', '|'];
        let detectedDelimiter = ',';
        let maxColumns = 0;
        
        for (const delimiter of delimiters) {
          const lines = sample.split('\n').slice(0, 3); // Check first 3 lines
          const columnCounts = lines.map(line => line.split(delimiter).length);
          const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
          
          if (avgColumns > maxColumns && avgColumns > 1) {
            maxColumns = avgColumns;
            detectedDelimiter = delimiter;
          }
        }
        
        console.log('Detected delimiter:', detectedDelimiter, 'with average columns:', maxColumns);
        
        // Parse with detected delimiter
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          delimiter: detectedDelimiter,
          dynamicTyping: false, // Keep everything as strings for consistency
          transformHeader: (header) => {
            // Clean header names
            return header ? header.trim().replace(/[^a-zA-Z0-9_]/g, '_') : `Column_${Date.now()}`;
          },
          transform: (value) => {
            // Clean and normalize values
            if (value === null || value === undefined) return '';
            return String(value).trim();
          },
          complete: (results) => {
            console.log('CSV parsing results:', results);
            
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
              // Try to continue with partial data if possible
              if (results.data.length === 0) {
                reject(new Error('CSV parsing error: ' + results.errors[0].message));
                return;
              }
            }
            
            if (results.data.length === 0) {
              reject(new Error('CSV file is empty or has no valid data'));
              return;
            }
            
            const firstRow = results.data[0];
            if (!firstRow || typeof firstRow !== 'object') {
              reject(new Error('Invalid CSV structure'));
              return;
            }
            
            const columns = Object.keys(firstRow);
            if (columns.length === 0) {
              reject(new Error('No columns found in CSV file'));
              return;
            }
            
            // Clean data - remove rows that are completely empty
            const cleanData = results.data.filter(row => {
              if (!row || typeof row !== 'object') return false;
              return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
            });
            
            if (cleanData.length === 0) {
              reject(new Error('No valid data rows found after cleaning'));
              return;
            }
            
            const tableName = file.name.replace(/\.csv$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
            
            console.log('CSV processing successful:', {
              rows: cleanData.length,
              columns: columns.length,
              sampleRow: cleanData[0]
            });
            
            resolve({
              data: cleanData,
              columns,
              tableName
            });
          },
                     error: (error) => {
             console.error('CSV parsing error:', error);
             // Try fallback method
             console.log('Trying fallback CSV processing...');
             processCSVFileFallback(file)
               .then(resolve)
               .catch(fallbackError => {
                 reject(new Error('CSV parsing failed: ' + error.message + '. Fallback also failed: ' + fallbackError.message));
               });
           }
         });
        
      } catch (error) {
        console.error('CSV processing error:', error);
        reject(new Error('Failed to process CSV file: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

// Execute SQL query with improved error handling and fallback
export const executeQuery = async (data, query, tableName = 'data_table') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No valid data provided');
  }
  
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid query provided');
  }
  
  try {
    // Convert data to SQL table first
    const { db } = await convertToSQLTable(data, tableName);
    
    console.log('Executing query:', query);
    console.log('Database object:', db);
    
    // Execute the query using the correct SQL.js API
    let result;
    try {
      // Try different methods to execute the query
      if (typeof db.all === 'function') {
        // Use the 'all' method for SELECT queries
        result = db.all(query);
        console.log('Query executed using db.all, result:', result);
      } else if (typeof db.exec === 'function') {
        // Fallback to exec method
        const execResult = db.exec(query);
        result = execResult && execResult.length > 0 ? execResult[0].values : [];
        console.log('Query executed using db.exec, result:', result);
      } else if (typeof db.prepare === 'function') {
        // Alternative approach using prepare/step
        const stmt = db.prepare(query);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        result = results;
        console.log('Query executed using prepare/step, result:', result);
      } else {
        throw new Error('No suitable query execution method found. Available methods: ' + Object.getOwnPropertyNames(db).join(', '));
      }
    } catch (execError) {
      console.error('Query execution failed:', execError);
      throw new Error(`Query execution failed: ${execError.message}`);
    }
    
    // Clean up the database
    if (typeof db.close === 'function') {
      db.close();
    }
    
    // Ensure result is always an array
    if (!Array.isArray(result)) {
      result = [];
    }
    
    console.log('Final query result:', result);
    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    throw new Error(`SQL Error: ${error.message}`);
  }
};

// Export data to JSON
export const exportToJSON = (data) => {
  const jsonString = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data_export_${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export data to CSV with improved formatting
export const exportToCSV = (data) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  
  // Create CSV content with proper escaping
  const csvContent = [
    // Header row with proper escaping
    headers.map(header => {
      const escapedHeader = header.includes(',') || header.includes('"') || header.includes('\n') 
        ? `"${header.replace(/"/g, '""')}"` 
        : header;
      return escapedHeader;
    }).join(','),
    
    // Data rows with proper escaping
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        
        // Escape special characters
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data_export_${timestamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Test function to check if Excel processing is working
export const testExcelProcessing = async (file) => {
  try {
    console.log('Testing Excel file:', file.name, 'Size:', file.size);
    
    // Validate file
    validateExcelFile(file);
    console.log('File validation passed');
    
    // Try to read the file
    const arrayBuffer = await file.arrayBuffer();
    console.log('File read successfully, size:', arrayBuffer.byteLength);
    
    // Try to parse with XLSX
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      cellStyles: false
    });
    
    console.log('Workbook parsed successfully');
    console.log('Sheet names:', workbook.SheetNames);
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in workbook');
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('Worksheet found:', sheetName);
    console.log('Worksheet range:', worksheet['!ref']);
    
    return {
      success: true,
      sheetNames: workbook.SheetNames,
      firstSheet: sheetName,
      range: worksheet['!ref']
    };
    
  } catch (error) {
    console.error('Excel test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export data to Excel with improved formatting
export const exportToExcel = (data) => {
  if (data.length === 0) return;
  
  // Create worksheet with data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths based on content
  const columnWidths = [];
  const headers = Object.keys(data[0] || {});
  
  headers.forEach((header, index) => {
    // Calculate max width based on header and data
    let maxWidth = header.length;
    
    data.forEach(row => {
      const cellValue = String(row[header] || '');
      maxWidth = Math.max(maxWidth, cellValue.length);
    });
    
    // Set reasonable limits
    maxWidth = Math.min(Math.max(maxWidth, 10), 50);
    columnWidths.push({ wch: maxWidth });
  });
  
  worksheet['!cols'] = columnWidths;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Add worksheet to workbook
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Export');
  
  // Write file with timestamp
  XLSX.writeFile(workbook, `data_export_${timestamp}.xlsx`);
};
