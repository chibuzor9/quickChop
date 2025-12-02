import express from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Place order
router.post('/', orderController.placeOrder);

// Get customer orders
router.get('/', orderController.getCustomerOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Track order
router.get('/:id/track', orderController.trackOrder);

export default router;
