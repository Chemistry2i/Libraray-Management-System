// Standardized Response
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, message, statusCode = 500, errorCode = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
  });
};

const sendPaginated = (res, message, items, page, limit, total) => {
  sendSuccess(res, message, {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
