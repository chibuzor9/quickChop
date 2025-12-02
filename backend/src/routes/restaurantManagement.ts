import express from 'express';
import * as restaurantManagementController from '../controllers/restaurantManagementController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', restaurantManagementController.getDashboard);

// Orders management
router.get('/orders', restaurantManagementController.getRestaurantOrders);
router.put('/orders/:id/status', restaurantManagementController.updateOrderStatus);

// Menu management
router.get('/menu', restaurantManagementController.getRestaurantMenu);
router.post('/menu', restaurantManagementController.addMenuItem);
router.put('/menu/:id', restaurantManagementController.updateMenuItem);
router.delete('/menu/:id', restaurantManagementController.deleteMenuItem);

// Analytics
router.get('/analytics', restaurantManagementController.getAnalytics);

// Profile and settings
router.get('/profile', restaurantManagementController.getRestaurantProfile);
router.put('/profile', restaurantManagementController.updateRestaurantProfile);
router.put('/settings', restaurantManagementController.updateRestaurantSettings);

export default router;
