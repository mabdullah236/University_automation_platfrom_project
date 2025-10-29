
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    res.status(500).json({
        message: 'An unexpected error occurred on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};

module.exports = errorHandler;
