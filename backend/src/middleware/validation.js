const { body, query, param, validationResult } = require("express-validator");

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10 })
    .toInt()
    .withMessage("Limit must be between 1 and 100"),
  query("q")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Search query too long (max 100 characters)"),
];

const validateItemId = [
  param("id")
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Item ID must be a positive integer"),
];

const validateNewItem = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name is required (1-200 characters)"),
  body("category")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category is required (1-50 characters)"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      // details: errors.array()  // Need to be only used in development
    });
  }
  next();
};

module.exports = {
  validatePagination,
  validateItemId,
  validateNewItem,
  handleValidationErrors,
};
