const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get token from the header
    const token = req.header('Authorization');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        // The token is usually sent as "Bearer <token>", so we split it
        const decoded = jwt.verify(token.split(' ')[1], "my_jwt_secret_key_12345");
        req.user = decoded.user; // Add user payload to the request object
        next(); // Move to the next piece of middleware/route handler
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};