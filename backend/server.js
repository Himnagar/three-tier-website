const express = require("express");
const mysql = require("mysql2");

const app = express();

const PORT = 5000;

// Connect to MySQL
const db = mysql.createConnection({
    host: "database",
    user: "appuser",
    password: "apppassword",
    database: "appdb"
});

// Test database connection
db.connect((err) => {

    if (err) {

        console.error("Database connection failed:", err.message);

    } else {

        console.log("Connected to MySQL database");

    }

});

// API
app.get("/users", (req, res) => {

    db.query("SELECT * FROM users", (err, results) => {

        if (err) {

            return res.status(500).json({
                error: "Database error"
            });

        }

        if (results.length === 0) {

            return res.json({
                message: "Backend connected to database",
                user: "No users found"
            });

        }

        res.json({
            message: "Backend connected to database",
            user: results[0].name
        });

    });

});

// Health check
app.get("/health", (req, res) => {

    res.json({
        status: "Backend is healthy"
    });

});

app.listen(PORT, () => {

    console.log(`Backend running on port ${PORT}`);

});
