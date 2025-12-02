import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Signup
export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { fullName, email, password, role, phoneNumber, address } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        // Create new user
        const user = await User.create({
            fullName,
            email,
            password,
            role,
            phoneNumber,
            address,
        });

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                address: user.address,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// Login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check if account is active
        if (!user.isActive) {
            res.status(401).json({ message: 'Account is deactivated' });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                address: user.address,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user
export const getCurrentUser = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        res.json({
            user: {
                id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                role: req.user.role,
                phoneNumber: req.user.phoneNumber,
                address: req.user.address,
                profileImage: req.user.profileImage,
                isEmailVerified: req.user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update profile
export const updateProfile = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { fullName, phoneNumber, address, profileImage } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                ...(fullName && { fullName }),
                ...(phoneNumber && { phoneNumber }),
                ...(address && { address }),
                ...(profileImage && { profileImage }),
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                address: user.address,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset password (simplified - sends email in production)
export const resetPassword = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists for security
            res.json({ message: 'If the email exists, a reset link will be sent' });
            return;
        }

        // TODO: Implement password reset token and email sending
        // For now, just acknowledge the request
        res.json({ message: 'If the email exists, a reset link will be sent' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
