// backend/server.js (UPDATED FOR FILE UPLOADS)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer'; // <-- 1. IMPORT MULTER

// Import route files
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { addImagesToProperty } from './controllers/propertyController.js'; // <-- 2. IMPORT THE NEW CONTROLLER FUNCTION

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// --- NEW: Route for adding images to a property ---
// This route handles multiple file uploads. 'images' is the field name from the frontend.
app.post('/api/properties/:id/images', upload.array('images', 10), addImagesToProperty);

// Start the Server
app.listen(PORT, () => {
  console.log(`Hama Homes server is running on http://localhost:${PORT}`);
});