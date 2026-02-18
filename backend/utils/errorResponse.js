const sendError = (res, error, statusCode = 500) => {
  console.error(error.message || error);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(statusCode).json({
    success: false,
    message: isProd ? 'Something went wrong' : (error.message || 'Internal Server Error'),
  });
};

module.exports = { sendError };
