import express from 'express';
import * as riderController from '../controllers/riderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get available deliveries
router.get('/deliveries/available', riderController.getAvailableDeliveries);

// Get active deliveries
router.get('/deliveries/active', riderController.getActiveDeliveries);

// Accept a delivery
router.post('/deliveries/:id/accept', riderController.acceptDelivery);

// Complete a delivery
router.post('/deliveries/:id/complete', riderController.completeDelivery);

// Get earnings
router.get('/earnings', riderController.getEarnings);

// Get earnings history
router.get('/earnings/history', riderController.getEarningsHistory);

// Get delivery history
router.get('/deliveries/history', riderController.getDeliveryHistory);

export default router;
