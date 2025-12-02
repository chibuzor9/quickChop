import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';

// Get available deliveries for riders
export const getAvailableDeliveries = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        // Get orders that are ready for pickup but don't have a rider yet
        const availableOrders = await Order.find({
            status: 'ready',
            riderId: { $exists: false },
        })
            .populate('restaurantId', 'name address phoneNumber')
            .populate('customerId', 'fullName phoneNumber')
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            count: availableOrders.length,
            data: availableOrders,
        });
    } catch (error) {
        console.error('Get available deliveries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Accept a delivery
export const acceptDelivery = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.status !== 'ready') {
            res.status(400).json({ message: 'Order is not ready for pickup' });
            return;
        }

        if (order.riderId) {
            res.status(400).json({ message: 'Order already assigned to another rider' });
            return;
        }

        // Assign rider and update status
        order.riderId = req.user._id;
        order.status = 'picked-up';
        await order.save();

        const updatedOrder = await Order.findById(id)
            .populate('restaurantId', 'name address phoneNumber')
            .populate('customerId', 'fullName phoneNumber');

        res.json({
            success: true,
            message: 'Delivery accepted successfully',
            data: updatedOrder,
        });
    } catch (error) {
        console.error('Accept delivery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get rider's active deliveries
export const getActiveDeliveries = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        const activeDeliveries = await Order.find({
            riderId: req.user._id,
            status: 'picked-up',
        })
            .populate('restaurantId', 'name address phoneNumber')
            .populate('customerId', 'fullName phoneNumber')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: activeDeliveries.length,
            data: activeDeliveries,
        });
    } catch (error) {
        console.error('Get active deliveries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Complete a delivery
export const completeDelivery = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.riderId?.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'This is not your delivery' });
            return;
        }

        if (order.status !== 'picked-up') {
            res.status(400).json({ message: 'Order is not in picked-up status' });
            return;
        }

        // Update status and delivery time
        order.status = 'delivered';
        order.paymentStatus = 'paid';
        order.actualDeliveryTime = new Date();
        await order.save();

        res.json({
            success: true,
            message: 'Delivery completed successfully',
            data: order,
        });
    } catch (error) {
        console.error('Complete delivery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get rider earnings
export const getEarnings = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        const completedOrders = await Order.find({
            riderId: req.user._id,
            status: 'delivered',
        });

        // Calculate earnings (assuming 80% of delivery fee goes to rider)
        const totalEarnings = completedOrders.reduce(
            (sum, order) => sum + order.deliveryFee * 0.8,
            0
        );

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayOrders = completedOrders.filter(
            (order) => order.actualDeliveryTime && order.actualDeliveryTime >= todayStart
        );

        const todayEarnings = todayOrders.reduce(
            (sum, order) => sum + order.deliveryFee * 0.8,
            0
        );

        res.json({
            success: true,
            data: {
                totalEarnings: totalEarnings.toFixed(2),
                todayEarnings: todayEarnings.toFixed(2),
                totalDeliveries: completedOrders.length,
                todayDeliveries: todayOrders.length,
            },
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get earnings history
export const getEarningsHistory = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        const { startDate, endDate } = req.query;

        const filter: any = {
            riderId: req.user._id,
            status: 'delivered',
        };

        if (startDate || endDate) {
            filter.actualDeliveryTime = {};
            if (startDate) {
                filter.actualDeliveryTime.$gte = new Date(startDate as string);
            }
            if (endDate) {
                filter.actualDeliveryTime.$lte = new Date(endDate as string);
            }
        }

        const orders = await Order.find(filter)
            .populate('restaurantId', 'name')
            .sort({ actualDeliveryTime: -1 });

        const history = orders.map((order) => ({
            orderId: order._id,
            restaurant: order.restaurantId,
            deliveryFee: order.deliveryFee,
            earnings: (order.deliveryFee * 0.8).toFixed(2),
            deliveredAt: order.actualDeliveryTime,
        }));

        res.json({
            success: true,
            count: history.length,
            data: history,
        });
    } catch (error) {
        console.error('Get earnings history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get rider delivery history
export const getDeliveryHistory = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            res.status(403).json({ message: 'Access denied. Riders only.' });
            return;
        }

        const deliveries = await Order.find({
            riderId: req.user._id,
            status: 'delivered',
        })
            .populate('restaurantId', 'name address')
            .populate('customerId', 'fullName')
            .sort({ actualDeliveryTime: -1 })
            .limit(50);

        res.json({
            success: true,
            count: deliveries.length,
            data: deliveries,
        });
    } catch (error) {
        console.error('Get delivery history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
