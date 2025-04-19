import express from "express";
import bodyParser from "body-parser";

import db from "./utils/db/cnx.js";

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Routes

// Health check
/**
 * @swagger
 * /health/ping:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Returns "pong" if the service is running
 */
app.get("/health/ping", (req, res) => {
  res.status(200).send("pong");
});

// Get all questions for a survey
/**
 * @swagger
 * /surveys/{survey_id}/questions:
 *   get:
 *     summary: Get all questions for a survey
 *     responses:
 *       200:
 *         description: Returns a list of all questions for a survey
 *         content:
 *          application/json:
 *           schema:
 *            type: array
 *           items:
 *           type: object
 *          properties:
 *            question_id:
 *              type: integer
 *            survey_id:
 *              type: integer
 *            question_text:
 *              type: string
 *           question_type:
 *             type: string
 *           required:
 *             type: boolean
 *       400:
 *        description: survey_id is required
 *       500:
 *        description: Database query failed
 */
app.get("/surveys/:survey_id/questions", (req, res) => {
  const surveyId = Number(req.params.survey_id);
  if (!surveyId) {
    return res.status(400).json({ error: "survey_id is required" });
  }
  db.query(
    "SELECT * FROM Questions WHERE survey_id = ?",
    [surveyId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(results);
    }
  );
});

// Post a new question
/**
 * @swagger
 * /surveys/{survey_id}/questions:
 *   post:
 *     summary: Post a new question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_text:
 *                 type: string
 *               question_type:
 *                 type: string
 *               required:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Returns the ID of the new question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question_id:
 *                   type: integer
 *       400:
 *         description: survey_id, question_text, question_type, and required are required
 *       500:
 *         description: Database query failed
 */
app.post("/surveys/:survey_id/questions", (req, res) => {
  const surveyId = Number(req.params.survey_id);
  const { question_text, question_type, required } = req.body;
  if (!surveyId || !question_text || !question_type || required === undefined) {
    return res.status(400).json({
      error:
        "survey_id, question_text, question_type, and required are required",
    });
  }
  db.query(
    "INSERT INTO Questions (survey_id, question_text, question_type, required) VALUES (?, ?, ?, ?)",
    [surveyId, question_text, question_type, required],
    (err, results) => {
      if (err) {
        console.error("Error posting question:", err.message);
        res.status(500).json({ error: "Database query failed" });
        return;
      }
      res.status(201).json({ question_id: results.insertId });
    }
  );
});

// Update a question
/**
 * @swagger
 * /questions/{question_id}:
 *   put:
 *     summary: Update a question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_text:
 *                 type: string
 *               question_type:
 *                 type: string
 *               required:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Returns the ID of the updated question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question_id:
 *                   type: integer
 *       400:
 *         description: question_id, question_text, question_type, and required are required
 *       500:
 *         description: Database query failed
 */

app.put("/questions/:question_id", (req, res) => {
  const questionId = Number(req.params.question_id);
  const { question_text, question_type, required } = req.body;
  if (
    !questionId ||
    !question_text ||
    !question_type ||
    required === undefined
  ) {
    return res.status(400).json({
      error:
        "question_id, question_text, question_type, and required are required",
    });
  }
  db.query(
    "UPDATE Questions SET question_text = ?, question_type = ?, required = ? WHERE question_id = ?",
    [question_text, question_type, required, questionId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
        return;
      }
      res.status(200).json({ question_id: questionId });
    }
  );
});

// Delete a question
/**
 * @swagger
 * /questions/{question_id}:
 *   delete:
 *     summary: Delete a question
 *     responses:
 *       200:
 *         description: Returns the ID of the deleted question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question_id:
 *                   type: integer
 *       400:
 *         description: question_id is required
 *       500:
 *         description: Database query failed
 */
app.delete("/questions/:question_id", (req, res) => {
  const questionId = Number(req.params.question_id);
  if (!questionId) {
    return res.status(400).json({ error: "question_id is required" });
  }
  db.query(
    "DELETE FROM Questions WHERE question_id = ?",
    [questionId],
    (err, results) => {
      if (err) {
        console.error("Error deleting question:", err.message);
        res.status(500).json({ error: "Database query failed" });
        return;
      }
      res.status(204).json({ question_id: questionId });
    }
  );
});

export default app;
