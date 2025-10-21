// routes/propertyRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { 
  createProperty, 
  getAllProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty, 
  getMyProperties // ✅ NEW CONTROLLER
} from '../controllers/propertyController.js';
import { protect, isLandlord } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rulebook for creating/updating a property
const validateProperty = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a valid number'),
  body('location').notEmpty().withMessage('Location is required'),
];

// --- Protected Landlord Routes ---
router.get('/my-properties', protect, isLandlord, getMyProperties); // ✅ NEW ROUTE

// --- Public Routes ---
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// --- Protected Landlord Routes ---
router.post('/', protect, isLandlord, validateProperty, createProperty);
router.put('/:id', protect, isLandlord, validateProperty, updateProperty);
router.delete('/:id', protect, isLandlord, deleteProperty);

export default router;
