# Kennettechnologies Clinic Management System - Backend

This is the backend server for the Kennettechnologies Clinic Management System. It provides a RESTful API for managing clinic operations including patient management, doctor scheduling, appointments, medical records, billing, and inventory management.

## Features

- User authentication and authorization
- Patient management
- Doctor management
- Appointment scheduling
- Medical records management
- Billing and invoicing
- Inventory management
- Email notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the `src/config` directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/clinic-management
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30
   JWT_COOKIE_EXPIRE=30
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_email_password
   FROM_EMAIL=noreply@kennettechnologies.com
   FROM_NAME=Kennettechnologies Clinic
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/v1/auth/register - Register a new user
- POST /api/v1/auth/login - Login user
- GET /api/v1/auth/me - Get current user
- PUT /api/v1/auth/updatedetails - Update user details
- PUT /api/v1/auth/updatepassword - Update password
- POST /api/v1/auth/forgotpassword - Forgot password
- PUT /api/v1/auth/resetpassword/:resettoken - Reset password

## Security

The server implements several security measures:
- JWT authentication
- Password hashing
- XSS protection
- MongoDB query sanitization
- Rate limiting
- CORS configuration
- Helmet security headers

## Error Handling

The server includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- Server errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 