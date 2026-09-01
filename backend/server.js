import express from "express";
import cors from "cors";
import { pool } from "./db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "token required" });
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: "invalid or expired token" });
    }
};

app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existing.rowCount > 0) {
        return res.status(409).json({ error: "email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
        [email, passwordHash]
    );

    res.status(201).json(result.rows[0]);
});

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (result.rowCount === 0) {
        return res.status(401).json({ error: "invalid email or password" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "invalid email or password" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token: token });
});

app.get("/api/todos", requireAuth, async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM todos WHERE user_id = $1 ORDER BY id",
        [req.user.id]
    );
    res.json(result.rows);
});

app.post("/api/todos", requireAuth, async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "title is required" });
    }

    const result = await pool.query(
        "INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *",
        [title, req.user.id]
    );

    res.status(201).json(result.rows[0]);
});

app.put("/api/todos/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "in_progress", "done"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "invalid status" });
    }

    const result = await pool.query(
        "UPDATE todos SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
        [status, id, req.user.id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "todo not found" });
    }

    res.json(result.rows[0]);
});

app.delete("/api/todos/:id", requireAuth, async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, req.user.id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "todo not found" });
    }

    res.json({ message: "deleted" });
});

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});