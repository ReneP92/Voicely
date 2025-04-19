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

// Get a response
/**
 * @swagger
 * /responses/{response_id}:
 *  get:
 *    summary: Get a response by ID
 *    parameters:
 *      - in: path
 *        name: response_id
 *        required: true
 *        description: ID of the response
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Returns a response
 *      404:
 *        description: Response not found
 *      500:
 *        description: Database query failed
 */
app.get("/responses/:response_id", (req, res) => {
  const responseId = Number(req.params.response_id);
  db.query(
    "SELECT * FROM Responses WHERE response_id = ?",
    [responseId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Response not found" });
      }
      res.status(200).json(results);
    }
  );
});

// Delete a response
app.delete("/responses/:response_id", (req, res) => {
  const responseId = Number(req.params.response_id);
  db.query(
    "DELETE FROM Responses WHERE response_id = ?",
    [responseId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).send();
    }
  );
});

// Get all responses for a survey
/**
 * @swagger
 * /surveys/{survey_id}/responses:
 *   get:
 *     summary: Get all responses for a survey
 *     parameters:
 *       - in: path
 *         name: survey_id
 *         required: true
 *         description: ID of the survey
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns all responses for a survey
 *       500:
 *         description: Database query failed
 */
app.get("/surveys/:survey_id/responses", (req, res) => {
  const surveyId = Number(req.params.survey_id);

  db.query(
    "SELECT * FROM Responses WHERE survey_id = ?",
    [surveyId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(results);
    }
  );
});

// Submit a Response
/**
 * @swagger
 * /surveys/{survey_id}/responses:
 *   post:
 *     summary: Submit a response
 *     parameters:
 *       - in: path
 *         name: survey_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               response_id:
 *                 type: integer
 *               survey_id:
 *                 type: integer
 *               participant_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Survey created successfully
 *       500:
 *         description: Database query failed
 */
app.post("/surveys/:survey_id/responses", (req, res) => {
  const surveyId = Number(req.params.survey_id);
  const response = req.body;

  db.query(
    "INSERT INTO Responses (survey_id, participant_id) VALUES (?, ?)",
    [surveyId, response.participant_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json({
        response_id: results.insertId,
        survey_id: surveyId,
        participant_id: response.participant_id,
      });
    }
  );
});

// Get a Response Detail
/**
 * @swagger
 * /response_details/{response_detail_id}:
 *   get:
 *     summary: Get a response detail by ID
 *     parameters:
 *      - in: path
 *        name: response_detail_id
 *        required: true
 *        description: ID of the response detail
 *        schema:
 *          type: integer
 *     responses:
 *        200:
 *          description: Returns a response detail
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  response_detail_id:
 *                    type: integer
 *                  response_id:
 *                    type: integer
 *                  question_id:
 *                    type: integer
 *                  option_id:
 *                    type: integer
 *                  answer_text:
 *                    type: string
 *        404:
 *          description: Response detail not found
 *        500:
 *          description: Database query failed
 */
app.get("/response_details/:response_detail_id", (req, res) => {
  const responseDetailId = Number(req.params.response_detail_id);

  db.query(
    "SELECT * FROM Response_Details WHERE response_detail_id = ?",
    [responseDetailId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Response detail not found" });
      }
      res.status(200).json(results);
    }
  );
});

// Get Response Details for a Response
/**
 * @swagger
 * /responses/{response_id}/response_details:
 *  get:
 *    summary: Get all response details for a response
 *    parameters:
 *     - in: path
 *       name: response_id
 *       required: true
 *       description: ID of the response
 *       schema:
 *         type: integer
 *    responses:
 *      200:
 *        description: Returns all response details for a response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  response_detail_id:
 *                    type: integer
 *                  response_id:
 *                    type: integer
 *                  question_id:
 *                    type: integer
 *                  option_id:
 *                    type: integer
 *                  answer_text:
 *                    type: string
 *      500:
 *        description: Database query failed
 */
app.get("/responses/:response_id/response_details", (req, res) => {
  const responseId = Number(req.params.response_id);

  db.query(
    "SELECT * FROM Response_Details WHERE response_id = ?",
    [responseId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(results);
    }
  );
});

// Submit a Response Detail
/**
 * @swagger
 * /responses/{response_id}/response_details:
 *   post:
 *     summary: Submit a response detail
 *     parameters:
 *       - in: path
 *         name: response_id
 *         required: true
 *         description: ID of the response
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_id:
 *                 type: integer
 *               option_id:
 *                 type: integer
 *               answer_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Response detail created successfully
 *       500:
 *         description: Database query failed
 */
app.post("/responses/:response_id/response_details", (req, res) => {
  const responseId = Number(req.params.response_id);
  const responseDetail = req.body;

  db.query(
    "INSERT INTO Response_Details (response_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?)",
    [
      responseId,
      responseDetail.question_id,
      responseDetail.option_id,
      responseDetail.answer_text,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(201).json({ response_detail_id: results.insertId });
    }
  );
});

export default app;
