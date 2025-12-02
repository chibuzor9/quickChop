import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';

// Get restaurant dashboard data
export const getDashboard = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        // Find restaurant owned by this user
        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        // Get today's orders
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayOrders = await Order.find({
            restaurantId: restaurant._id,
            createdAt: { $gte: todayStart },
        });

        const pendingOrders = await Order.find({
            restaurantId: restaurant._id,
            status: { $in: ['pending', 'confirmed', 'preparing'] },
        }).countDocuments();

        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.subtotal, 0);

        // Get all-time stats
        const totalOrders = await Order.find({
            restaurantId: restaurant._id,
        }).countDocuments();

        const completedOrders = await Order.find({
            restaurantId: restaurant._id,
            status: 'delivered',
        });

        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.subtotal, 0);

        res.json({
            success: true,
            data: {
                todayOrders: todayOrders.length,
                todayRevenue: todayRevenue.toFixed(2),
                pendingOrders,
                totalOrders,
                totalRevenue: totalRevenue.toFixed(2),
                restaurantInfo: restaurant,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get restaurant orders
export const getRestaurantOrders = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { status } = req.query;

        const filter: any = { restaurantId: restaurant._id };

        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('customerId', 'fullName phoneNumber')
            .populate('riderId', 'fullName phoneNumber')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error('Get restaurant orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status
export const updateOrderStatus = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Verify this order belongs to this restaurant
        if (order.restaurantId.toString() !== restaurant._id.toString()) {
            res.status(403).json({ message: 'This order does not belong to your restaurant' });
            return;
        }

        // Validate status transitions
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order,
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get restaurant menu
export const getRestaurantMenu = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const menuItems = await MenuItem.find({ restaurantId: restaurant._id })
            .sort({ category: 1, name: 1 });

        res.json({
            success: true,
            count: menuItems.length,
            data: menuItems,
        });
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add menu item
export const addMenuItem = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { name, description, price, category, image, preparationTime, isAvailable } = req.body;

        const menuItem = await MenuItem.create({
            restaurantId: restaurant._id,
            name,
            description,
            price,
            category,
            image,
            preparationTime,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
        });

        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            data: menuItem,
        });
    } catch (error) {
        console.error('Add menu item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update menu item
export const updateMenuItem = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            res.status(404).json({ message: 'Menu item not found' });
            return;
        }

        // Verify this menu item belongs to this restaurant
        if (menuItem.restaurantId.toString() !== restaurant._id.toString()) {
            res.status(403).json({ message: 'This menu item does not belong to your restaurant' });
            return;
        }

        const { name, description, price, category, image, preparationTime, isAvailable } = req.body;

        if (name) menuItem.name = name;
        if (description) menuItem.description = description;
        if (price !== undefined) menuItem.price = price;
        if (category) menuItem.category = category;
        if (image) menuItem.image = image;
        if (preparationTime !== undefined) menuItem.preparationTime = preparationTime;
        if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

        await menuItem.save();

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem,
        });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete menu item
export const deleteMenuItem = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            res.status(404).json({ message: 'Menu item not found' });
            return;
        }

        // Verify this menu item belongs to this restaurant
        if (menuItem.restaurantId.toString() !== restaurant._id.toString()) {
            res.status(403).json({ message: 'This menu item does not belong to your restaurant' });
            return;
        }

        await MenuItem.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Menu item deleted successfully',
        });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get restaurant analytics
export const getAnalytics = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { startDate, endDate } = req.query;

        const filter: any = { restaurantId: restaurant._id };

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate as string);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate as string);
            }
        }

        const orders = await Order.find(filter);

        const totalOrders = orders.length;
        const completedOrders = orders.filter((o) => o.status === 'delivered').length;
        const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
        const totalRevenue = orders
            .filter((o) => o.status === 'delivered')
            .reduce((sum, order) => sum + order.subtotal, 0);

        // Top selling items
        const itemSales: { [key: string]: number } = {};
        orders.forEach((order) => {
            order.items.forEach((item) => {
                const key = item.name;
                itemSales[key] = (itemSales[key] || 0) + item.quantity;
            });
        });

        const topItems = Object.entries(itemSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, quantity]) => ({ name, quantity }));

        res.json({
            success: true,
            data: {
                totalOrders,
                completedOrders,
                cancelledOrders,
                totalRevenue: totalRevenue.toFixed(2),
                averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
                topSellingItems: topItems,
            },
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get restaurant profile
export const getRestaurantProfile = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        res.json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        console.error('Get restaurant profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update restaurant profile
export const updateRestaurantProfile = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const {
            name,
            description,
            cuisine,
            image,
            address,
            phoneNumber,
            deliveryFee,
            minimumOrder,
            openingHours,
        } = req.body;

        if (name) restaurant.name = name;
        if (description) restaurant.description = description;
        if (cuisine) restaurant.cuisine = cuisine;
        if (image) restaurant.image = image;
        if (address) restaurant.address = address;
        if (phoneNumber) restaurant.phoneNumber = phoneNumber;
        if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
        if (minimumOrder !== undefined) restaurant.minimumOrder = minimumOrder;
        if (openingHours) restaurant.openingHours = openingHours;

        await restaurant.save();

        res.json({
            success: true,
            message: 'Restaurant profile updated successfully',
            data: restaurant,
        });
    } catch (error) {
        console.error('Update restaurant profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update restaurant settings
export const updateRestaurantSettings = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'restaurant') {
            res.status(403).json({ message: 'Access denied. Restaurant owners only.' });
            return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        const { isOpen } = req.body;

        if (isOpen !== undefined) {
            restaurant.isOpen = isOpen;
        }

        await restaurant.save();

        res.json({
            success: true,
            message: 'Restaurant settings updated successfully',
            data: restaurant,
        });
    } catch (error) {
        console.error('Update restaurant settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
