# QuickChop Backend API

Backend server for QuickChop food delivery application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ User authentication (signup, login, JWT)
- ✅ Role-based access control (Customer, Rider, Restaurant)
- ✅ MongoDB database with Mongoose ODM
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ TypeScript for type safety
- ✅ CORS enabled for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```env
MONGODB_URI=mongodb+srv://<atlas-username>:<user-password>@cluster0.b1hcnn5.mongodb.net/quickchop?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phoneNumber": "+1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "isEmailVerified": false
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phoneNumber": "+1234567890",
    "address": "123 Main St"
  }
}
```

#### PUT /api/auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "phoneNumber": "+1234567890",
  "address": "456 Oak Ave"
}
```

#### POST /api/auth/reset-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Health Check

#### GET /health
Check server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T18:00:00.000Z",
  "environment": "development"
}
```

## Database Schema

### User Model

```typescript
{
  fullName: String (required, 2-100 chars)
  email: String (required, unique, validated)
  password: String (required, hashed, min 6 chars)
  role: 'customer' | 'rider' | 'restaurant' (required)
  phoneNumber: String (optional)
  address: String (optional)
  profileImage: String (optional)
  isEmailVerified: Boolean (default: false)
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   └── User.ts           # User schema
│   ├── controllers/
│   │   └── authController.ts # Auth logic
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   ├── routes/
│   │   └── auth.ts           # Auth routes
│   └── server.ts             # Express app setup
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## Testing with Postman/Thunder Client

### 1. Signup
```
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "customer"
}
```

### 2. Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Get Profile (use token from login)
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-token-here>
```

## Security Features

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Email validation and sanitization
- Password minimum length enforcement
- Role-based access control
- Protected routes require authentication

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Next Steps

To extend the backend:

1. Add additional models (Restaurant, Order, Menu, etc.)
2. Implement email verification
3. Add password reset functionality
4. Create restaurant/rider/order endpoints
5. Add file upload for profile images
6. Implement real-time features with Socket.io
7. Add payment integration
8. Implement admin panel

## MongoDB Collections

The database is named `quickchop` and currently contains:
- **users** - User accounts for all roles

## Support

For issues or questions, please contact the development team.
