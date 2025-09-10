const fileService = require('../services/fileService');
const queryService = require('../services/queryService');
const database = require('../config/database');
const logger = require('../utils/logger');

class DatasetController {
  /**
   * Upload dataset file
   */
  async uploadDataset(req, res) {
    try {
      const { file } = req;
      const { name } = req.body;
      const userId = req.user?.id || null;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Dataset name is required'
        });
      }

      logger.info(`Uploading dataset: ${name} by user: ${userId}`);

      // Process file
      const fileInfo = await fileService.processFile(file, name);

      // Save dataset info to database (use actual table name created by fileService)
      const result = await database.run(
        `INSERT INTO datasets (name, filename, file_path, file_size, columns, row_count, table_name, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          fileInfo.filename,
          fileInfo.filePath,
          fileInfo.fileSize,
          JSON.stringify(fileInfo.columns),
          fileInfo.rowCount,
          fileInfo.tableName,
          userId
        ]
      );

      // Get created dataset
      const dataset = await database.get(
        'SELECT * FROM datasets WHERE id = ?',
        [result.id]
      );

      logger.info(`Dataset uploaded successfully: ${dataset.id}`);

      res.status(201).json({
        success: true,
        data: {
          id: dataset.id,
          name: dataset.name,
          filename: dataset.filename,
          columns: fileInfo.columns,
          rowCount: dataset.row_count,
          fileSize: dataset.file_size,
          createdAt: dataset.created_at
        },
        message: 'Dataset uploaded successfully'
      });

    } catch (error) {
      logger.error('Dataset upload error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * List all datasets
   */
  async listDatasets(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const userId = req.user?.id || null;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let params = [];

      if (userId) {
        whereClause = 'WHERE user_id = ?';
        params.push(userId);
      }

      if (search) {
        whereClause = whereClause ? `${whereClause} AND` : 'WHERE';
        whereClause += ' name LIKE ?';
        params.push(`%${search}%`);
      }

      // Get datasets
      const datasets = await database.all(
        `SELECT id, name, filename, file_size, row_count, table_name, created_at, updated_at
         FROM datasets 
         ${whereClause}
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );

      // Get total count
      const countResult = await database.get(
        `SELECT COUNT(*) as total FROM datasets ${whereClause}`,
        params
      );

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);

      logger.info(`Retrieved ${datasets.length} datasets`);

      res.json({
        success: true,
        data: {
          datasets: datasets.map(ds => ({
            id: ds.id,
            name: ds.name,
            filename: ds.filename,
            fileSize: ds.file_size,
            rowCount: ds.row_count,
            createdAt: ds.created_at,
            updatedAt: ds.updated_at
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      logger.error('List datasets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve datasets'
      });
    }
  }

  /**
   * Get dataset details
   */
  async getDataset(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;

      let whereClause = 'WHERE id = ?';
      let params = [id];

      if (userId) {
        whereClause += ' AND user_id = ?';
        params.push(userId);
      }

      const dataset = await database.get(
        `SELECT * FROM datasets ${whereClause}`,
        params
      );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset not found'
        });
      }

      // Get dataset schema
      const schema = await queryService.getDatasetSchema(id);

      // Get sample data
      const sampleData = await queryService.getSampleData(id, 5);

      logger.info(`Retrieved dataset: ${id}`);

      res.json({
        success: true,
        data: {
          id: dataset.id,
          name: dataset.name,
          filename: dataset.filename,
          fileSize: dataset.file_size,
          rowCount: dataset.row_count,
          columns: JSON.parse(dataset.columns || '[]'),
          createdAt: dataset.created_at,
          updatedAt: dataset.updated_at,
          tableName: dataset.table_name,
          schema: schema.columns,
          sampleData: sampleData.data
        }
      });

    } catch (error) {
      logger.error('Get dataset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dataset'
      });
    }
  }

  /**
   * Execute SQL query on dataset
   */
  async executeQuery(req, res) {
    try {
      const { id } = req.params;
      const { query } = req.body;
      const userId = req.user?.id || null;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query is required'
        });
      }

      logger.info(`Executing query on dataset ${id} by user ${userId}`);

      const result = await queryService.executeQuery(id, query, userId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          executionTime: result.executionTime,
          rowCount: result.rowCount,
          dataset: result.dataset
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          executionTime: result.executionTime
        });
      }

    } catch (error) {
      logger.error('Execute query error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute query'
      });
    }
  }

  /**
   * Export dataset data
   */
  async exportData(req, res) {
    try {
      const { id } = req.params;
      const { format = 'json', query } = req.query;
      const userId = req.user?.id || null;

      logger.info(`Exporting dataset ${id} in ${format} format`);

      let data;
      let filename;

      if (query) {
        // Export query results
        const result = await queryService.executeQuery(id, query, userId);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: result.error
          });
        }
        data = result.data;
        filename = `query_results_${id}_${Date.now()}`;
      } else {
        // Export full dataset
        const sampleData = await queryService.getSampleData(id, 10000);
        data = sampleData.data;
        filename = `dataset_${id}_${Date.now()}`;
      }

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(data);
      } else if (format === 'csv') {
        const csv = require('papaparse');
        const csvData = csv.unparse(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvData);
      } else {
        res.status(400).json({
          success: false,
          error: 'Unsupported export format. Use "json" or "csv"'
        });
      }

    } catch (error) {
      logger.error('Export data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export data'
      });
    }
  }

  /**
   * Get dataset statistics
   */
  async getDatasetStats(req, res) {
    try {
      const { id } = req.params;

      logger.info(`Getting stats for dataset ${id}`);

      const stats = await queryService.getDatasetStats(id);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Get dataset stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dataset statistics'
      });
    }
  }

  /**
   * Get query history for dataset
   */
  async getQueryHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      logger.info(`Getting query history for dataset ${id}`);

      const history = await queryService.getQueryHistory(id, parseInt(limit));

      res.json({
        success: true,
        data: {
          datasetId: id,
          queries: history
        }
      });

    } catch (error) {
      logger.error('Get query history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve query history'
      });
    }
  }

  /**
   * Delete dataset
   */
  async deleteDataset(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;

      // Get dataset info
      let whereClause = 'WHERE id = ?';
      let params = [id];

      if (userId) {
        whereClause += ' AND user_id = ?';
        params.push(userId);
      }

      const dataset = await database.get(
        `SELECT * FROM datasets ${whereClause}`,
        params
      );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset not found'
        });
      }

      logger.info(`Deleting dataset: ${id}`);

      // Delete file from disk
      await fileService.deleteFile(dataset.file_path);

      // Delete from database
      await database.run('DELETE FROM datasets WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Dataset deleted successfully'
      });

    } catch (error) {
      logger.error('Delete dataset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete dataset'
      });
    }
  }
}

module.exports = new DatasetController();
