const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.json({
            status: "OK",
            database: "Connected"
        });

    } catch (error) {

        res.status(500).json({
            status: "ERROR",
            database: "Disconnected"
        });

    }

});


// ===============================
// REGISTER
// ===============================

app.post("/api/auth/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        if (password.length < 8) {

            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                message: "Email already registered"
            });

        }

        // Hash password

        const passwordHash = await bcrypt.hash(password, 12);

        // Insert user

        const result = await pool.query(
            `
            INSERT INTO users
            (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email
            `,
            [
                name.trim(),
                normalizedEmail,
                passwordHash
            ]
        );

        const user = result.rows[0];

        // Generate JWT

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.status(201).json({

            message: "Registration successful",

            token,

            user

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// ===============================
// LOGIN
// ===============================

app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });

        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const result = await pool.query(
            `
            SELECT *
            FROM users
            WHERE email = $1
            `,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }

        const user = result.rows[0];

        // Compare password

        const passwordValid =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordValid) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }

        // Generate JWT

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({

            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// ===============================
// JWT AUTHENTICATION
// ===============================

function authenticate(req, res, next) {

    const authHeader =
        req.headers.authorization || "";

    const token =
        authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

    if (!token) {

        return res.status(401).json({
            message: "Authentication required"
        });

    }

    try {

        const decoded =
            jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

}


// ===============================
// PROTECTED PROFILE API
// ===============================

app.get("/api/me", authenticate, async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT id, name, email, created_at
            FROM users
            WHERE id = $1
            `,
            [req.user.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// ===============================
// COURSES
// ===============================

app.get("/api/courses", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT id, title, description, level
            FROM courses
            ORDER BY id
            `
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to fetch courses"
        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Backend running on port ${PORT}`
    );

});
