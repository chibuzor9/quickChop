import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import MenuItem from '../models/MenuItem';
import Restaurant from '../models/Restaurant';

// Get all restaurants
export const getRestaurants = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { cuisine, rating } = req.query;

        const filter: any = { isOpen: true };

        if (cuisine) {
            filter.cuisine = { $in: [cuisine] };
        }

        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }

        const restaurants = await Restaurant.find(filter).sort({ rating: -1 });

        res.json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get restaurant by ID
export const getRestaurantById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid restaurant ID format' });
            return;
        }

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            res.status(404).json({ message: 'Restaurant not found' });
            return;
        }

        res.json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get restaurant menu
export const getRestaurantMenu = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid restaurant ID format' });
            return;
        }

        const menuItems = await MenuItem.find({
            restaurantId: id,
            isAvailable: true,
        }).sort({ category: 1, name: 1 });

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
