// backend/routes/applicationRoutes.js
import express from 'express';
import { 
  createApplication, 
  getMyApplications, 
  getApplicationsForLandlord, 
  updateApplicationStatus 
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tenant routes
router.post('/', protect, createApplication);
router.get('/my-applications', protect, getMyApplications);

// Landlord routes
router.get('/landlord', protect, getApplicationsForLandlord);
router.put('/:id/status', protect, updateApplicationStatus);

export default router;
