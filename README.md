# Employee Management System

A comprehensive employee management system with role-based access control, user management, and organizational hierarchy features.

## 🌐 Live Demo

- Frontend: [https://employee-management-system-coral-two.vercel.app](https://employee-management-system-coral-two.vercel.app)
- Backend: [https://employee-management-system-3xbw.onrender.com](https://employee-management-system-3xbw.onrender.com)

> **Note:** The backend is hosted on Render's free tier. Please be patient as it may take 40-50 seconds to start up after periods of inactivity.

## 🚀 Features

- **Role-Based Access Control**
  - Master Admin
  - Admin
  - Manager
  - Team Leader
  - User

- **User Management**
  - Create, Read, Update, Delete users
  - Assign roles and positions
  - Set up reporting hierarchy (Manager/TL relationships)

- **Dashboard**
  - Role-specific views
  - Organizational structure visualization
  - Team statistics and metrics

- **Profile Management**
  - Update personal information
  - View role and position details
  - Track team relationships

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui Components
- React Router DOM
- Framer Motion (for animations)
- Axios (for API calls)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Bcrypt (for password hashing)
- CORS enabled

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Deepakshi725/Employee_Management_System.git
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd Client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
database_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

5. Start the backend server:
```bash
cd server
npm start
```

6. Start the frontend development server:
```bash
cd Client
npm run dev
```

## 🔐 Default Login Credentials

For testing purposes, you can use these credentials:

- **Master Admin**
  - Email: masteradmin@gmail.com
  - Password: masteradmin

## 🏗️ Project Structure

```
Employee_Management_System/
├── Client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions and types
│   └── public/           # Static assets
│
└── server/               # Backend Node.js application
    ├── models/          # Mongoose models
    ├── routes/          # API routes
    ├── middleware/      # Custom middleware
    └── db.js           # Database connection
```

## 🔄 API Endpoints

### Authentication
- `POST /api/login` - User login
- `GET /api/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics


## 🙏 Acknowledgments

- Shadcn/ui for the beautiful component library
- MongoDB Atlas for the database hosting
- Render for backend hosting
- Vercel for frontend hosting 