import express from 'express';
import * as restaurantController from '../controllers/restaurantController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all restaurants
router.get('/', restaurantController.getRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Get restaurant menu
router.get('/:id/menu', restaurantController.getRestaurantMenu);

export default router;
