import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
    name: string;
    description: string;
    cuisine: string[];
    image: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: number;
    minimumOrder: number;
    estimatedDeliveryTime?: number; // in minutes
    address: string;
    phoneNumber: string;
    isOpen: boolean;
    openingHours: {
        day: string;
        open: string;
        close: string;
    }[];
    openingTime?: string; // simplified opening time e.g., "09:00 AM"
    closingTime?: string; // simplified closing time e.g., "10:00 PM"
    ownerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
    {
        name: {
            type: String,
            required: [true, 'Restaurant name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        cuisine: {
            type: [String],
            default: [],
        },
        image: {
            type: String,
            required: [true, 'Restaurant image is required'],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        deliveryTime: {
            type: String,
            default: '30-45 min',
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        minimumOrder: {
            type: Number,
            default: 0,
        },
        estimatedDeliveryTime: {
            type: Number, // in minutes
        },
        address: {
            type: String,
            required: [true, 'Restaurant address is required'],
        },
        phoneNumber: {
            type: String,
        },
        isOpen: {
            type: Boolean,
            default: true,
        },
        openingHours: [
            {
                day: String,
                open: String,
                close: String,
            },
        ],
        openingTime: {
            type: String, // simplified e.g., "09:00 AM"
        },
        closingTime: {
            type: String, // simplified e.g., "10:00 PM"
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // Each user can only own one restaurant
        },
    },
    {
        timestamps: true,
    }
);

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;
