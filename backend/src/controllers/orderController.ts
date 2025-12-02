import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';

// Place a new order
export const placeOrder = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const {
            restaurantId,
            items,
            deliveryAddress,
            customerPhone,
            paymentMethod,
            specialInstructions,
        } = req.body;

        // Calculate totals
        const subtotal = items.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
        );

        const restaurant = await Restaurant.findById(restaurantId);
        const deliveryFee = restaurant?.deliveryFee || 0;
        const total = subtotal + deliveryFee;

        // Create order
        const order = await Order.create({
            customerId: req.user._id,
            restaurantId,
            items,
            subtotal,
            deliveryFee,
            total,
            deliveryAddress,
            customerPhone,
            customerName: req.user.fullName,
            paymentMethod,
            specialInstructions,
            status: 'pending',
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order,
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get customer orders
export const getCustomerOrders = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const orders = await Order.find({ customerId: req.user._id })
            .populate('restaurantId', 'name image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get order by ID
export const getOrderById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('restaurantId', 'name image address phoneNumber')
            .populate('riderId', 'fullName phoneNumber');

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Check if user owns this order
        if (
            order.customerId.toString() !== req.user._id.toString() &&
            req.user.role !== 'restaurant' &&
            req.user.role !== 'rider'
        ) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Track order
export const trackOrder = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('restaurantId', 'name address phoneNumber')
            .populate('riderId', 'fullName phoneNumber');

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Check if user owns this order
        if (
            order.customerId.toString() !== req.user._id.toString() &&
            req.user.role !== 'restaurant' &&
            req.user.role !== 'rider'
        ) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
