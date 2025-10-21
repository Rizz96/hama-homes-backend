// backend/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  addFavorite, 
  removeFavorite, 
  getFavorites, 
  updateUserProfile // <-- 1. Import the new function
} from '../controllers/userController.js';

const router = express.Router();

// Favorites routes
router.route('/favorites').get(protect, getFavorites);
router.route('/favorites/:propertyId').post(protect, addFavorite).delete(protect, removeFavorite);

// Profile route
router.route('/profile').put(protect, updateUserProfile); // <-- 2. Add this new route

export default router;