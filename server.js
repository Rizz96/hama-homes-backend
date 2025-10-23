// backend/server.js (FINAL CORRECTED VERSION)
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
import { protect } from './middleware/authMiddleware.js'; // <-- IMPORT PROTECT

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS CONFIGURATION ---
const corsOptions = {
  origin: ['http://localhost:5173', 'https://your-frontend-url.com'],
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
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

// --- Route for adding images to a property (THE FIX IS HERE) ---
app.post('/api/properties/:id/images', protect, upload.array('images', 10), addImagesToProperty);

// Start the Server
app.listen(PORT, () => {
  console.log(`Hama Homes server is running on http://localhost:${PORT}`);
});