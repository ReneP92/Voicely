import express from "express";
import bodyParser from "body-parser";

import db from "./utils/db/cnx.js";

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Routes

// Health check
app.get("/health/ping", (req, res) => {
  res.status(200).send("pong");
});

// Get all users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get("/users", (req, res) => {
  db.query("SELECT * FROM Users", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json(results);
  });
});

// Get a single user by ID
/**
 * @swagger
 * /users/{user_id}:
 *   get:
 *     summary: Retrieve a single user by ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Database query failed
 */
app.get("/users/:user_id", (req, res) => {
  const userId = parseInt(req.params.user_id);
  db.query(
    "SELECT * FROM Users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(results[0]);
    }
  );
});

// Create a new user
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.post("/users", (req, res) => {
  const { orgainsationId, email, name, roleId, userGroup } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  db.query(
    "INSERT INTO Users (organisation_id, email, name, role_id, user_group) VALUES (?, ?, ?, ?, ?)",
    [orgainsationId, email, name, roleId, userGroup],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(201).json({
        user_id: results.insertId,
        orgainsationId,
        email,
        name,
        roleId,
        userGroup,
      });
    }
  );
});

// Update an existing user
/**
 * @swagger
 * /users/{user_id}:
 *   put:
 *     summary: Update an existing user
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.put("/users/:user_id", (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { name, email } = req.body;
  db.query(
    "UPDATE Users SET name = ?, email = ? WHERE user_id = ?",
    [name, email, userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ user_id: userId, name, email });
    }
  );
});

// Delete a user
/**
 * @swagger
 * /users/{user_id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted
 */
app.delete("/users/:user_id", (req, res) => {
  const userId = parseInt(req.params.user_id);
  db.query("DELETE FROM Users WHERE user_id = ?", [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(204).send();
  });
});

export default app;
