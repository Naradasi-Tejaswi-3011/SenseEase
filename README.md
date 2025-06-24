# SenseEase - Accessible E-commerce Platform

A neurodiversity-focused e-commerce platform with comprehensive accessibility features and WCAG 2.1 AA compliance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation & Setup

1. **Clone and navigate to the project:**
   ```bash
   cd SenseEase-main
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on: http://localhost:5000

3. **Frontend Setup (in a new terminal):**
   ```bash
   cd frontend  
   npm install
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

## 📁 Project Structure

```
SenseEase-main/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database & app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React/Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables
The frontend automatically connects to `http://localhost:5000/api` for the backend.

## 🎯 Features

### ✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Password validation and security
- Protected routes

### ✅ **Accessibility Features**
- WCAG 2.1 AA compliance
- High contrast themes
- Font size adjustments
- Dyslexia-friendly fonts
- Reduced motion support
- Screen reader compatibility
- Keyboard navigation

### ✅ **E-commerce Functionality**
- Shopping cart system
- User profiles
- Order management
- Product browsing

### ✅ **Neurodiversity Support**
- ADHD-friendly interface
- Autism spectrum accommodations
- Sensory sensitivity options
- Cognitive load reduction

## 🧪 Testing

### Demo Credentials
- **Email:** demo@senseease.com
- **Password:** demo123

### API Testing
Test the backend API directly:
```bash
# Health check
curl http://localhost:5000/health

# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"test123","phone":"1234567890"}'
```

## 🔄 Development Workflow

1. **Start both servers:**
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

2. **Make changes:**
   - Backend changes auto-restart with nodemon
   - Frontend has hot reload with Vite

3. **Database:**
   - Uses MongoDB Atlas
   - User data is automatically saved
   - Check MongoDB Compass or Atlas dashboard to verify data

## 🐛 Troubleshooting

### Common Issues:

1. **"Validation failed" error during signup:**
   - Password must be at least 6 characters
   - All required fields must be filled

2. **Database connection issues:**
   - Check MongoDB URI in backend/.env
   - Ensure MongoDB Atlas cluster is running
   - Verify network access in Atlas settings

3. **Port conflicts:**
   - Backend: Change PORT in .env file
   - Frontend: Change port in vite.config.js

4. **CORS errors:**
   - Ensure FRONTEND_URL in backend/.env matches frontend URL
   - Check CORS configuration in server.js

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)  
- Mobile (320px - 767px)

## 🎨 Theming & Accessibility

- **Default Theme:** Clean, modern interface
- **High Contrast:** Black background, white text
- **Low Saturation:** Reduced color intensity
- **Font Options:** Inter (default) or OpenDyslexic
- **Size Options:** Small, Medium, Large, Extra Large

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or similar
- Set environment variables
- Ensure MongoDB Atlas is accessible

### Frontend Deployment  
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update API URL in environment variables

---

**Built with ❤️ for accessibility and inclusion**
