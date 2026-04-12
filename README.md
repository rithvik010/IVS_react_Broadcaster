# Livestream - Full Stack Application

A streaming application with a React frontend and Node.js/PostgreSQL backend for managing IVS (Interactive Video Service) streaming.

## 📁 Project Structure

```
geministream/
├── Backend/                 # Express.js API server
│   ├── app.js              # Main backend application
│   └── package.json        # Backend dependencies
│
├── my-ivs-app/             # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
└── README.md               # This file
```

---

## 🔧 Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)

Verify installations:
```bash
node --version
npm --version
psql --version
```

---

## 📋 Configuration Required

### 1. Backend Database Setup

The backend connects to PostgreSQL. You need to:

#### Step 1: Create a PostgreSQL Database
Open pgAdmin or use `psql` command line:

```sql
-- Create a new database
CREATE DATABASE apptest;

-- Connect to the database
\c apptest

-- Create the stream_configs table
CREATE TABLE stream_configs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    stream_key VARCHAR(255) NOT NULL,
    ingest_endpoint VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (Optional) Insert test data
INSERT INTO stream_configs (username, stream_key, ingest_endpoint)
VALUES ('test_user', 'your-stream-key-here', 'your-ingest-endpoint-here');
```

#### Step 2: Update Backend Database Credentials

Edit `Backend/app.js` (lines ~12-17) with your PostgreSQL credentials:

```javascript
const dbClient = new Client({
    user: 'postgres',              // Your PostgreSQL username
    host: 'localhost',             // Database host
    database: 'yourdbname',           // Database name
    password: 'yourdbpass',          // ⚠️ YOUR PostgreSQL password
    port: 5432,                    // PostgreSQL port (default: 5432)
});
```

---

## 📦 Dependencies

### Backend Dependencies
- **express** - Web framework for Node.js
- **cors** - Enable cross-origin requests for React frontend
- **pg** - PostgreSQL client

### Frontend Dependencies
- **react** - UI framework
- **react-dom** - React DOM rendering
- **amazon-ivs-player** - IVS player for streaming
- **amazon-ivs-web-broadcast** - IVS broadcast library
- **vite** - Build tool and dev server

---

## 🚀 Getting Started

### Step 1: Install Dependencies

#### For Backend:
```bash
cd Backend
npm install
```

#### For Frontend:
```bash
cd my-ivs-app
npm install
```

---

### Step 2: Start the Backend Server

From the `Backend/` directory:

```bash
npm start
```

Expected output:
```
✅ Connected to PostgreSQL Database
🚀 Backend server is running at http://localhost:3000
```

**Backend runs on:** `http://localhost:3000`

---

### Step 3: Start the Frontend Application

From the `my-ivs-app/` directory:

```bash
npm run dev
```

Expected output:
```
VITE v8.x.x  ready in 123 ms

➜  Local:   http://localhost:5173/
```

**Frontend runs on:** `http://localhost:5173/`

---

## 🔗 API Endpoints

### Get Stream Key
**Endpoint:** `GET /api/get-stream-key`

**Query Parameters:**
- `user` (required) - Username to fetch stream configuration for

**Example Request:**
```bash
curl "http://localhost:3000/api/get-stream-key?user=test_user"
```

**Example Response:**
```json
{
  "stream_key": "your-stream-key-here",
  "ingest_endpoint": "your-ingest-endpoint-here"
}
```

**Error Responses:**
- 400: Missing username parameter
- 404: User not found in database
- 500: Internal server error

---

## 🎯 Running Both Services Simultaneously

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd geministream/Backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd geministream/my-ivs-app
npm run dev
```

Then open `http://localhost:5173/` in your browser.

---

## 🛠️ Development Commands

### Backend
```bash
npm start      # Start the server
```

### Frontend
```bash
npm run dev    # Start dev server with hot reload
npm run build  # Build for production
npm run lint   # Run ESLint
npm run preview # Preview production build
```

---

## 🔍 Troubleshooting

### "Database connection error: connect ECONNREFUSED"
- PostgreSQL is not running. Start PostgreSQL service
- Check your database credentials in `Backend/app.js`
- Ensure the database `apptest` exists

### "User not found" error
- Verify the username exists in your `stream_configs` table
- Use database tools to check table contents:
  ```sql
  SELECT * FROM stream_configs;
  ```

### "Cannot find module 'express'" / "Cannot find module 'react'"
- Dependencies not installed. Run `npm install` in both `Backend/` and `my-ivs-app/` directories

### Frontend shows blank/errors
- Ensure backend is running on `http://localhost:3000`
- Check browser console for errors (F12)
- Verify API calls are reaching the backend

---

## 📝 Notes

- Backend and frontend run on **different ports** (3000 and 5173) and communicate via API calls
- CORS is enabled on the backend to allow requests from the React frontend
- Database credentials in `Backend/app.js` are currently hardcoded - consider using environment variables (`.env` file) for production
- The frontend uses Vite for fast development with hot module replacement (HMR)

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Amazon IVS Documentation](https://docs.aws.amazon.com/ivs/)

---

## ⚠️ Important Reminders

Before deploying to production:
1. Move database credentials to environment variables
2. Review PostgreSQL security settings
3. Enable HTTPS for API communications
4. Set up proper error logging and monitoring
5. Add input validation and sanitization
6. Implement authentication/authorization

---

**Last Updated:** April 2026
