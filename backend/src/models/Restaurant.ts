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
    address: string;
    phoneNumber: string;
    isOpen: boolean;
    openingHours: {
        day: string;
        open: string;
        close: string;
    }[];
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
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);

export default Restaurant;
