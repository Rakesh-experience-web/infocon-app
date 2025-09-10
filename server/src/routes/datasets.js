const express = require('express');
const multer = require('multer');
const datasetController = require('../controllers/datasetController');
const { validateQuery } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
    }
  }
});

/**
 * @route   POST /api/datasets/upload
 * @desc    Upload a new dataset file
 * @access  Public (for now, can be made private later)
 */
router.post('/upload', upload.single('file'), datasetController.uploadDataset);

/**
 * @route   GET /api/datasets
 * @desc    List all datasets with pagination and search
 * @access  Public
 */
router.get('/', datasetController.listDatasets);

/**
 * @route   GET /api/datasets/:id
 * @desc    Get dataset details including schema and sample data
 * @access  Public
 */
router.get('/:id', datasetController.getDataset);

/**
 * @route   POST /api/datasets/:id/query
 * @desc    Execute SQL query on dataset
 * @access  Public
 */
router.post('/:id/query', validateQuery, datasetController.executeQuery);

/**
 * @route   GET /api/datasets/:id/export
 * @desc    Export dataset data in JSON or CSV format
 * @access  Public
 */
router.get('/:id/export', datasetController.exportData);

/**
 * @route   GET /api/datasets/:id/stats
 * @desc    Get dataset statistics and column information
 * @access  Public
 */
router.get('/:id/stats', datasetController.getDatasetStats);

/**
 * @route   GET /api/datasets/:id/history
 * @desc    Get query history for dataset
 * @access  Public
 */
router.get('/:id/history', datasetController.getQueryHistory);

/**
 * @route   DELETE /api/datasets/:id
 * @desc    Delete dataset and associated files
 * @access  Public (for now, should be restricted to owner)
 */
router.delete('/:id', datasetController.deleteDataset);

module.exports = router;
