import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
    customerId: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    riderId?: mongoose.Types.ObjectId;
    items: {
        menuItemId: mongoose.Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
    }[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'delivered' | 'cancelled';
    deliveryAddress: string;
    customerPhone: string;
    customerName: string;
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
    specialInstructions?: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        riderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        items: [
            {
                menuItemId: {
                    type: Schema.Types.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        subtotal: {
            type: Number,
            required: true,
        },
        deliveryFee: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked-up', 'delivered', 'cancelled'],
            default: 'pending',
        },
        deliveryAddress: {
            type: String,
            required: true,
        },
        customerPhone: {
            type: String,
            required: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        specialInstructions: {
            type: String,
        },
        estimatedDeliveryTime: {
            type: Date,
        },
        actualDeliveryTime: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
