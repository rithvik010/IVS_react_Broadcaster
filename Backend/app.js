const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const port = 3000;

// 1. Enable CORS so your React app (running on a different port) is allowed to ask for data
app.use(cors());

// 2. Set up your database credentials
const dbClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Yourdb Name', // <-- Put your database name here
    password: 'DB password', // <-- Put your pgAdmin password here!
    port: 5432,
});

// Connect to the database once when the server starts
dbClient.connect()
  .then(() => console.log("✅ Connected to PostgreSQL Database"))
  .catch(err => console.error("❌ Database connection error:", err.stack));

// 3. Create the API Endpoint that React will call
app.get('/api/get-stream-key', async (req, res) => {
    // We grab the username from the URL (e.g., ?user=test_user)
    const username = req.query.user; 

    if (!username) {
        return res.status(400).json({ error: 'Please provide a username' });
    }

    try {
        const query = 'SELECT stream_key, ingest_endpoint FROM stream_configs WHERE username = $1';
        const result = await dbClient.query(query, [username]);

        if (result.rows.length > 0) {
            // Send the data back to React!
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching from DB:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Start the server
app.listen(port, () => {
    console.log(`🚀 Backend server is running at http://localhost:${port}`);
});