// backend/server.js (FINAL WORKING VERSION)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import route files
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- ROBUST CORS CONFIGURATION ---
const corsOptions = {
  origin: ['http://localhost:5173', 'https://your-frontend-url.com'], // Add your deployed frontend URL later
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
// NOTE: The 'app.options' line is removed. The 'cors' middleware handles preflight requests automatically.

// Middlewares
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// Start the Server
app.listen(PORT, () => {
  console.log(`Hama Homes server is running on http://localhost:${PORT}`);
});