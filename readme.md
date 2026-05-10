# Traveloop

## Project Overview

Traveloop is a comprehensive travel planning and booking platform designed to simplify the travel experience for users. The platform provides an integrated solution for trip planning, booking, and management.

## Project Goals

- Create an intuitive travel planning interface.
- Integrate multiple travel services and booking options.
- Provide personalized travel recommendations.
- Offer real-time updates and notifications.
- Enable seamless trip management and coordination.

## Key Features

### 1. Trip Planning
- Interactive trip itinerary builder.
- Destination recommendations based on user preferences.
- Budget planning tools.
- Timeline management.

### 2. Booking Integration
- Flight booking with comparison functionality.
- Hotel reservations.
- Car rental services.
- Activity and attraction bookings.
- Local transportation options.

### 3. User Experience
- Mobile-responsive design.
- Multi-language support.
- Personalized dashboard.
- Social sharing capabilities.
- Travel document management.

### 4. Advanced Features
- Real-time price tracking.
- Travel insurance integration.
- Local guides and recommendations.
- Travel community features.
- Offline trip planning.

## Technical Architecture

### Frontend
- Responsive web application built with React and Vite.
- Mobile-first design approach using Tailwind CSS.
- State management handled by React Query and Zustand.
- Cross-platform compatibility.

### Backend
- Scalable server architecture using Node.js and Express.
- Database management for user data with MySQL and Sequelize ORM.
- User authentication and authorization via JSON Web Tokens (JWT) and bcrypt.
- Payment processing system and notification services integrations.

### Security
- Data encryption and password hashing.
- Payment security and privacy protection measures.
- Express-validator for request validation, Helmet for HTTP header security.

## Target Audience

- Frequent travelers
- Budget-conscious travelers
- Families planning trips
- Solo adventurers
- Business travelers
- Tourists exploring new destinations

## Setup Guide

### Prerequisites

Make sure these are installed on your local machine:
- Node.js v18 or higher
- MySQL 8 or higher
- Git

### 1. Clone and Initialize

```bash
mkdir Traveloop && cd Traveloop
mkdir server client
git init
```

Root `.gitignore`:
```text
node_modules/
.env
dist/
```

### 2. MySQL Database Setup

Log into MySQL and run:
```sql
CREATE DATABASE traveloop;
CREATE USER 'traveloop_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON traveloop.* TO 'traveloop_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

```bash
cd server
npm init -y
npm install express sequelize mysql2 dotenv bcryptjs jsonwebtoken cors helmet morgan express-validator
npm install --save-dev nodemon sequelize-cli
```

Create `server/.env`:
```text
PORT=5000
DB_HOST=localhost
DB_USER=traveloop_user
DB_PASSWORD=yourpassword
DB_NAME=traveloop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `server/.sequelizerc`:
```javascript
const path = require('path')
module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
}
```

Initialize Sequelize:
```bash
npx sequelize-cli init
```

Update `server/config/database.js` with your `.env` values:
```javascript
require('dotenv').config()

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
}
```

Backend scripts in `server/package.json`:
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js",
  "db:migrate": "sequelize-cli db:migrate",
  "db:seed": "sequelize-cli db:seed:all",
  "db:reset": "sequelize-cli db:drop && sequelize-cli db:create && sequelize-cli db:migrate && sequelize-cli db:seed:all"
}
```

### 4. Frontend Setup

```bash
cd ../client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom @tanstack/react-query zustand recharts react-hook-form
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Update `client/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `client/.env`:
```text
VITE_API_URL=http://localhost:5000/api
```

Frontend scripts in `client/package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### 5. Running the Application

Open two terminals:

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Alternatively, use concurrently from the root directory:
```bash
npm init -y
npm install -D concurrently
```

Root `package.json`:
```json
"scripts": {
  "dev": "concurrently \"cd server && npm run dev\" \"cd client && npm run dev\"",
  "server": "cd server && npm run dev",
  "client": "cd client && npm run dev"
}
```

Run both services:
```bash
npm run dev
```

### 6. Database Workflow

```bash
cd server

# Run all migrations to create tables
npm run db:migrate

# Seed the database with sample cities and activities
npm run db:seed

# Perform a full reset (drop, create, migrate, seed)
npm run db:reset
```

## Deployment

### Backend on Railway
1. Push `server/` to GitHub.
2. Create a new project on Railway.
3. Add a MySQL plugin (Railway provides connection credentials).
4. Set environment variables in the Railway dashboard (matching `.env`).
5. Set start command to `node server.js`.

### Frontend on Vercel
1. Push `client/` to GitHub.
2. Import project on Vercel.
3. Set environment variable: `VITE_API_URL=https://your-railway-backend-url/api`.
4. Vercel auto-detects Vite and deploys the application.

## Future Roadmap

- AI-powered travel recommendations.
- Virtual reality trip previews.
- Blockchain-based travel documentation.
- Enhanced social features.
- Sustainability-focused travel options.

## Conclusion

Traveloop represents a significant opportunity to transform the travel industry by providing an integrated, user-friendly platform that simplifies the entire travel planning and booking process. With careful execution and continuous improvement, the platform has the potential to become a leading travel solution in the market.
