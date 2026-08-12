//middleware to protect routes
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) return res.status(404).json({ error: "User doesn't exist" });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token or Other error " && error.message });
    }
};
