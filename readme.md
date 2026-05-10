# Traveloop — Setup Guide

## Prerequisites

Make sure these are installed on your machine:

- Node.js v18+
- MySQL 8+
- Git

---

## Project Structure

```
Traveloop/
├── server/         # Node.js + Express backend
├── client/         # React + Vite frontend
└── README.md
```

---

## 1. Clone & Initialize

```bash
mkdir Traveloop && cd Traveloop
mkdir server client
git init
```

Root `.gitignore`:

```
node_modules/
.env
dist/
```

---

## 2. MySQL — Create Database

Log into MySQL and run:

```sql
CREATE DATABASE traveloop;
CREATE USER 'traveloop_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON traveloop.* TO 'traveloop_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Backend Setup

```bash
cd server
npm init -y
npm install express sequelize mysql2 dotenv bcryptjs jsonwebtoken cors helmet morgan express-validator
npm install --save-dev nodemon sequelize-cli
```

### Environment variables

Create `server/.env`:

```
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

### Sequelize config

Create `server/.sequelizerc`:

```js
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

```js
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

### Backend scripts

Add to `server/package.json`:

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js",
  "db:migrate": "sequelize-cli db:migrate",
  "db:seed": "sequelize-cli db:seed:all",
  "db:reset": "sequelize-cli db:drop && sequelize-cli db:create && sequelize-cli db:migrate && sequelize-cli db:seed:all"
}
```

### Run backend

```bash
npm run dev
# Server runs at http://localhost:5000
```

---

## 4. Frontend Setup

```bash
cd ../client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom @tanstack/react-query zustand recharts react-hook-form
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### Tailwind config

Update `client/tailwind.config.js`:

```js
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

Add to `client/src/index.css` (replace existing content):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Environment variables

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### Frontend scripts

`client/package.json` scripts (already set by Vite):

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Run frontend

```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 5. Running Both Together

Open two terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Or install concurrently at the root level:

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

Then just:

```bash
npm run dev
```

---

## 6. Database Workflow

```bash
cd server

# Run all migrations (creates tables)
npm run db:migrate

# Seed with cities and activities data
npm run db:seed

# Full reset (drop → create → migrate → seed)
npm run db:reset
```

---

## 7. Deployment

### Backend — Railway

1. Push `server/` to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Add a MySQL plugin — Railway provides connection credentials
4. Set environment variables in Railway dashboard (same as `.env`)
5. Set start command: `node server.js`

### Frontend — Vercel

1. Push `client/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-railway-backend-url/api`
4. Vercel auto-detects Vite — deploy

---

## 8. Folder Structure Reference

```
server/
├── config/database.js
├── controllers/
│   ├── authController.js
│   ├── tripController.js
│   ├── stopController.js
│   ├── cityController.js
│   ├── activityController.js
│   ├── budgetController.js
│   ├── packingController.js
│   ├── noteController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── models/
│   ├── index.js
│   ├── User.js
│   ├── Trip.js
│   ├── Stop.js
│   ├── City.js
│   ├── Activity.js
│   ├── StopActivity.js
│   ├── BudgetItem.js
│   ├── PackingItem.js
│   └── TripNote.js
├── routes/
│   ├── auth.js
│   ├── trips.js
│   ├── stops.js
│   ├── cities.js
│   ├── activities.js
│   ├── budget.js
│   ├── packing.js
│   ├── notes.js
│   └── admin.js
├── seeders/
├── migrations/
├── app.js
└── server.js

client/
└── src/
    ├── api/index.js
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   └── shared/
    ├── context/AuthContext.jsx
    ├── hooks/
    ├── pages/
    ├── store/tripStore.js
    ├── utils/helpers.js
    ├── App.jsx
    └── main.jsx
```

---

## Common Issues

**react-query peer dep error** — use `@tanstack/react-query` not `react-query`.

**tailwindcss init fails** — install `tailwindcss@3` specifically, v4 dropped the init command.

**MySQL connection refused** — make sure MySQL service is running: `sudo systemctl start mysqld`

**CORS error in browser** — ensure `CLIENT_URL` in `.env` matches exactly where your frontend runs.
