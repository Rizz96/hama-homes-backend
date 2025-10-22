// backend/server.js (WITH DEBUGGING LOGS)
console.log("SERVER STARTING: Reading server.js file...");

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log("SERVER STARTING: Dependencies imported successfully.");

// Load environment variables
dotenv.config();
console.log("SERVER STARTING: Environment variables loaded.");

// Import route files
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

console.log("SERVER STARTING: Route files imported successfully.");

const app = express();
const PORT = process.env.PORT || 3001;

// --- ROBUST CORS CONFIGURATION ---
const corsOptions = {
  origin: ['http://localhost:5173', 'https://your-frontend-url.com'], // Add your deployed frontend URL later
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

console.log("SERVER STARTING: Routes and middleware configured.");

// Start the Server
app.listen(PORT, () => {
  console.log(`Hama Homes server is running on http://localhost:${PORT}`);
});