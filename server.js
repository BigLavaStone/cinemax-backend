import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import "dotenv/config";
import apiRoutes from './routes/index.js';


const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).json({ message: "Cinema Booking API is running!" });
});

// ROUTES
app.use('/api', apiRoutes);

// DATABASE CONNECTION & SERVER START
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        console.log(MONGODB_URI);
        process.exit(1); 
    });