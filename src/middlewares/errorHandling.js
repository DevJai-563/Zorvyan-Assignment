//centralized error handling middleware with uniform error response structure
function errorHandlingMiddleware(err, req, res, next) {
  console.error(err); // Log the error for debugging

  const statusCode = err.statusCode || 500; // Default to 500 if no status code is provided
  const message = err.message || 'Internal Server Error'; // Default message

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details: err.details || null, // Optional additional error details
    },
  });
}

module.exports = errorHandlingMiddleware;