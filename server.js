// backend/server.js (UPDATED VERSION)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

// Load environment variables
dotenv.config();

// Import route files
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { addImagesToProperty } from './controllers/propertyController.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS CONFIGURATION (UPDATED) ---
const corsOptions = {
  origin: [
    'http://localhost:5173', // For local development
    'https://hama-7y4b.onrender.com' // Your actual frontend URL
  ],
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true // Add this if you're using authentication headers
};
app.use(cors(corsOptions));

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middlewares
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// --- Route for adding images to a property ---
app.post('/api/properties/:id/images', protect, upload.array('images', 10), addImagesToProperty);

// Start the Server
app.listen(PORT, () => {
  console.log(`Hama Homes server is running on http://localhost:${PORT}`);
});