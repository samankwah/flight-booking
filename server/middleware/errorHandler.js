// Error handler middleware - sends error response to client
// Note: Error logging is handled by errorLogger middleware
const errorHandler = (err, req, res, next) => {
  // Error is already logged by errorLogger middleware

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
