import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import restaurantRoutes from './routes/restaurants';
import riderRoutes from './routes/rider';
import restaurantManagementRoutes from './routes/restaurantManagement';

// Load environment variables
dotenv.config();
// Initialize express app
const app: Application = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
    console.log(`${ new Date().toISOString() } - ${ req.method } ${ req.path }`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/restaurant', restaurantManagementRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'QuickChop API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
        },
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
    });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://localhost:${ PORT }`);
            console.log(`📱 Network: http://10.192.181.179:${ PORT }`);
            console.log(`📱 Environment: ${ process.env.NODE_ENV || 'development' }`);
            console.log(`🔗 Health check: http://localhost:${ PORT }/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
