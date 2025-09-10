const database = require('../config/database');
const logger = require('../utils/logger');

class QueryService {
  constructor() {
    this.forbiddenKeywords = [
      'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER',
      'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM', 'REINDEX',
      'TRUNCATE', 'REPLACE', 'MERGE', 'UPSERT'
    ];

    this.maxQueryLength = 10000; // 10KB limit
    this.maxResultRows = 10000; // Limit results to prevent memory issues
  }

  /**
   * Execute SQL query on dataset
   */
  async executeQuery(datasetId, query, userId = null) {
    const startTime = Date.now();
    
    try {
      logger.info(`Executing query on dataset ${datasetId}: ${query.substring(0, 100)}...`);

      // Validate query
      this.validateQuery(query);

      // Get dataset info
      const dataset = await this.getDatasetInfo(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      // Execute query
      const results = await this.runQuery(dataset.table_name, query);

      // Log query execution
      const executionTime = Date.now() - startTime;
      await this.logQuery(datasetId, userId, query, executionTime, 'success');

      logger.info(`Query executed successfully in ${executionTime}ms, returned ${results.length} rows`);

      return {
        success: true,
        data: results,
        executionTime,
        rowCount: results.length,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          columns: JSON.parse(dataset.columns || '[]')
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Log failed query
      await this.logQuery(datasetId, userId, query, executionTime, 'error', error.message);

      logger.error('Query execution failed:', error);
      
      return {
        success: false,
        error: error.message,
        executionTime
      };
    }
  }

  /**
   * Validate SQL query for security
   */
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query provided');
    }

    if (query.length > this.maxQueryLength) {
      throw new Error(`Query too long. Maximum length is ${this.maxQueryLength} characters`);
    }

    const upperQuery = query.toUpperCase().trim();

    // Check for forbidden keywords
    for (const keyword of this.forbiddenKeywords) {
      if (upperQuery.includes(keyword)) {
        throw new Error(`Operation not allowed: ${keyword}`);
      }
    }

    // Must start with SELECT
    if (!upperQuery.startsWith('SELECT')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Prevent multiple statements
    if (upperQuery.includes(';') && upperQuery.split(';').length > 2) {
      throw new Error('Multiple statements not allowed');
    }

    // Prevent comments that might hide malicious code
    if (upperQuery.includes('--') || upperQuery.includes('/*')) {
      throw new Error('Comments not allowed in queries');
    }
  }

  /**
   * Get dataset information
   */
  async getDatasetInfo(datasetId) {
    try {
      const dataset = await database.get(
        'SELECT id, name, table_name, columns FROM datasets WHERE id = ?',
        [datasetId]
      );
      return dataset;
    } catch (error) {
      logger.error('Error getting dataset info:', error);
      throw new Error('Failed to retrieve dataset information');
    }
  }

  /**
   * Execute query on SQLite database
   */
  async runQuery(tableName, query) {
    try {
      // Replace table name in query if needed
      let processedQuery = query;
      
      // Replace 'data' with the actual table name
      processedQuery = processedQuery.replace(/FROM\s+data\b/gi, `FROM ${tableName}`);
      processedQuery = processedQuery.replace(/UPDATE\s+data\b/gi, `UPDATE ${tableName}`);
      processedQuery = processedQuery.replace(/DELETE\s+FROM\s+data\b/gi, `DELETE FROM ${tableName}`);
      
      // If query doesn't specify a table, use the dataset table
      if (!processedQuery.toUpperCase().includes('FROM')) {
        processedQuery = `${processedQuery} FROM ${tableName}`;
      }

      // Add LIMIT if not present to prevent memory issues
      if (!processedQuery.toUpperCase().includes('LIMIT')) {
        processedQuery = `${processedQuery} LIMIT ${this.maxResultRows}`;
      }

      logger.debug(`Executing processed query: ${processedQuery}`);

      const results = await database.all(processedQuery);

      return results || [];

    } catch (error) {
      logger.error('SQL execution error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('no such table')) {
        throw new Error('Dataset table not found. Please re-upload the dataset.');
      } else if (error.message.includes('no such column')) {
        throw new Error('Column not found in dataset. Please check column names.');
      } else if (error.message.includes('syntax error')) {
        throw new Error('SQL syntax error. Please check your query.');
      } else {
        throw new Error(`Query execution failed: ${error.message}`);
      }
    }
  }

  /**
   * Log query execution
   */
  async logQuery(datasetId, userId, query, executionTime, status, errorMessage = null) {
    try {
      await database.run(
        `INSERT INTO queries (dataset_id, user_id, query_text, execution_time, status, error_message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [datasetId, userId, query, executionTime, status, errorMessage]
      );
    } catch (error) {
      logger.error('Failed to log query:', error);
    }
  }

  /**
   * Get query history for dataset
   */
  async getQueryHistory(datasetId, limit = 50) {
    try {
      const queries = await database.all(
        `SELECT id, query_text, execution_time, status, created_at, error_message
         FROM queries 
         WHERE dataset_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [datasetId, limit]
      );

      return queries;
    } catch (error) {
      logger.error('Error getting query history:', error);
      throw new Error('Failed to retrieve query history');
    }
  }

  /**
   * Get dataset schema information
   */
  async getDatasetSchema(datasetId) {
    try {
      const dataset = await this.getDatasetInfo(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      // Get table schema
      const schema = await database.all(
        `PRAGMA table_info(${dataset.table_name})`
      );

      return {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          tableName: dataset.table_name
        },
        columns: schema.map(col => ({
          name: col.name,
          type: col.type,
          notNull: col.notnull === 1,
          primaryKey: col.pk === 1
        }))
      };
    } catch (error) {
      logger.error('Error getting dataset schema:', error);
      throw new Error('Failed to retrieve dataset schema');
    }
  }

  /**
   * Get sample data from dataset
   */
  async getSampleData(datasetId, limit = 10) {
    try {
      const dataset = await this.getDatasetInfo(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      const sampleData = await database.all(
        `SELECT * FROM ${dataset.table_name} LIMIT ?`,
        [limit]
      );

      return {
        dataset: {
          id: dataset.id,
          name: dataset.name
        },
        data: sampleData,
        totalRows: sampleData.length
      };
    } catch (error) {
      logger.error('Error getting sample data:', error);
      throw new Error('Failed to retrieve sample data');
    }
  }

  /**
   * Get dataset statistics
   */
  async getDatasetStats(datasetId) {
    try {
      const dataset = await this.getDatasetInfo(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      const columns = JSON.parse(dataset.columns || '[]');
      const stats = {};

      for (const column of columns) {
        try {
          // Get count of non-null values
          const countResult = await database.get(
            `SELECT COUNT(*) as count FROM ${dataset.table_name} WHERE "${column}" IS NOT NULL AND "${column}" != ''`
          );

          // Get unique values count
          const uniqueResult = await database.get(
            `SELECT COUNT(DISTINCT "${column}") as unique_count FROM ${dataset.table_name}`
          );

          stats[column] = {
            totalRows: countResult.count,
            uniqueValues: uniqueResult.unique_count,
            nullPercentage: ((dataset.row_count - countResult.count) / dataset.row_count * 100).toFixed(2)
          };
        } catch (error) {
          logger.warn(`Error getting stats for column ${column}:`, error);
          stats[column] = { error: 'Unable to calculate statistics' };
        }
      }

      return {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          totalRows: dataset.row_count
        },
        columnStats: stats
      };
    } catch (error) {
      logger.error('Error getting dataset stats:', error);
      throw new Error('Failed to retrieve dataset statistics');
    }
  }
}

module.exports = new QueryService();
