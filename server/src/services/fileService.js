const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class FileService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Process uploaded file and convert to SQLite table
   */
  async processFile(file, datasetName) {
    try {
      logger.info(`Processing file: ${file.originalname} for dataset: ${datasetName}`);

      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadPath, uniqueFilename);

      // Save file
      await this.saveFile(file, filePath);

      // Parse file and extract data
      const data = await this.parseFile(filePath, fileExtension);

      // Create SQLite table
      const tableName = `dataset_${Date.now()}`;
      await this.createSQLiteTable(tableName, data);

      return {
        filename: uniqueFilename,
        filePath,
        tableName,
        columns: Object.keys(data[0] || {}),
        rowCount: data.length,
        fileSize: file.size
      };
    } catch (error) {
      logger.error('File processing error:', error);
      throw error;
    }
  }

  /**
   * Validate uploaded file
   */
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file type. Only CSV and Excel files are allowed');
    }
  }

  /**
   * Save uploaded file to disk
   */
  async saveFile(file, filePath) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      const buffer = file.buffer;

      writeStream.write(buffer);
      writeStream.end();

      writeStream.on('finish', () => {
        logger.info(`File saved: ${filePath}`);
        resolve();
      });

      writeStream.on('error', (error) => {
        logger.error('File save error:', error);
        reject(error);
      });
    });
  }

  /**
   * Parse file based on extension
   */
  async parseFile(filePath, fileExtension) {
    try {
      if (fileExtension === '.csv') {
        return await this.parseCSV(filePath);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        return await this.parseExcel(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      logger.error('File parsing error:', error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  }

  /**
   * Parse CSV file
   */
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const csv = require('papaparse');
      const fileContent = fs.readFileSync(filePath, 'utf8');

      csv.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        trimValues: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            logger.warn('CSV parsing warnings:', results.errors);
          }

          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in CSV file'));
            return;
          }

          // Filter out completely empty rows
          const filteredData = results.data.filter(row => {
            return Object.values(row).some(value => 
              value !== '' && value !== null && value !== undefined
            );
          });

          if (filteredData.length === 0) {
            reject(new Error('No valid data rows found in CSV file'));
            return;
          }

          logger.info(`CSV parsed successfully: ${filteredData.length} rows`);
          resolve(filteredData);
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel file
   */
  async parseExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in Excel file');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found or empty`);
      }

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      if (!jsonData || jsonData.length === 0) {
        throw new Error('No data found in Excel sheet');
      }

      // Process data
      const headers = jsonData[0].map((header, index) => {
        if (header === null || header === undefined || header === '') {
          return `Column_${index + 1}`;
        }
        return String(header).trim();
      });

      const rows = jsonData.slice(1);
      const processedData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      logger.info(`Excel parsed successfully: ${processedData.length} rows`);
      return processedData;
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  }

  /**
   * Create SQLite table from parsed data
   */
  async createSQLiteTable(tableName, data) {
    const database = require('../config/database');
    
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to create table');
      }

      const columns = Object.keys(data[0]);
      
      // Determine column types
      const columnTypes = columns.map(col => {
        const sampleValue = data[0][col];
        if (this.isNumeric(sampleValue)) {
          return 'REAL';
        } else {
          return 'TEXT';
        }
      });

      // Create table
      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columns.map((col, i) => `"${col}" ${columnTypes[i]}`).join(', ')}
      )`;

      await database.run(createTableSQL);

      // Insert data
      const placeholders = columns.map(() => '?').join(',');
      const insertSQL = `INSERT INTO ${tableName} VALUES (${placeholders})`;

      for (const row of data) {
        const values = columns.map(col => row[col] || null);
        await database.run(insertSQL, values);
      }

      logger.info(`SQLite table created: ${tableName} with ${data.length} rows`);
    } catch (error) {
      logger.error('SQLite table creation error:', error);
      throw new Error(`Failed to create SQLite table: ${error.message}`);
    }
  }

  /**
   * Check if value is numeric
   */
  isNumeric(value) {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  /**
   * Delete file from disk
   */
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`File deleted: ${filePath}`);
      }
    } catch (error) {
      logger.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      logger.error('File info error:', error);
      throw error;
    }
  }
}

module.exports = new FileService();
