const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate SQL query
 */
const validateQuery = [
  body('query')
    .notEmpty()
    .withMessage('Query is required')
    .isString()
    .withMessage('Query must be a string')
    .isLength({ max: 10000 })
    .withMessage('Query too long. Maximum 10,000 characters allowed')
    .custom((value) => {
      const upperQuery = value.toUpperCase().trim();
      
      // Must start with SELECT
      if (!upperQuery.startsWith('SELECT')) {
        throw new Error('Only SELECT queries are allowed');
      }
      
      // Check for forbidden keywords
      const forbiddenKeywords = [
        'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER',
        'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM', 'REINDEX',
        'TRUNCATE', 'REPLACE', 'MERGE', 'UPSERT'
      ];
      
      for (const keyword of forbiddenKeywords) {
        if (upperQuery.includes(keyword)) {
          throw new Error(`Operation not allowed: ${keyword}`);
        }
      }
      
      // Prevent comments
      if (upperQuery.includes('--') || upperQuery.includes('/*')) {
        throw new Error('Comments not allowed in queries');
      }
      
      return true;
    }),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

/**
 * Validate dataset ID parameter
 */
const validateDatasetId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Dataset ID must be a positive integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

/**
 * Validate pagination parameters
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

/**
 * Validate export format
 */
const validateExportFormat = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Export format must be either "json" or "csv"'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

/**
 * Validate dataset name
 */
const validateDatasetName = [
  body('name')
    .notEmpty()
    .withMessage('Dataset name is required')
    .isString()
    .withMessage('Dataset name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Dataset name must be between 1 and 255 characters')
    .trim()
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

/**
 * Generic error handler for validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateQuery,
  validateDatasetId,
  validatePagination,
  validateExportFormat,
  validateDatasetName,
  handleValidationErrors
};
