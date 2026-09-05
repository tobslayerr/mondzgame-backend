const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const auth = async (req, res, next) => {
    const token = req.header('x-auth-token'); 

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user; 

        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ msg: 'Authorization denied: Not an admin or user not found' });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;