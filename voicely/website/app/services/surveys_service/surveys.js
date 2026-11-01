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

// Get all suveys
/**
 * @swagger
 * /surveys:
 *   get:
 *     summary: Get all surveys
 *     responses:
 *       200:
 *         description: A list of surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   created_by:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   survey_start:
 *                     type: string
 *                     format: date-time
 *                   survey_end:
 *                     type: string
 *                     format: date-time
 *                   allowed_roles:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Database query failed
 */
app.get("/surveys", (req, res) => {
  db.query("SELECT * FROM Surveys", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json(results);
  });
});

// Get a single survey by ID
/**
 * @swagger
 * /surveys/{survey_id}:
 *   get:
 *     summary: Get a single survey by ID
 *     parameters:
 *       - in: path
 *         name: survey_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the survey to retrieve
 *     responses:
 *       200:
 *         description: A single survey
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  survey_id:
 *                    type: integer
 *                    description: ID of the survey
 *                  organisation_id:
 *                    type: integer
 *                    description: ID of the organisation
 *                  created_by:
 *                    type: integer
 *                    description: ID of the user who created the survey
 *                  title:
 *                    type: string
 *                    description: Title of the survey
 *                  description:
 *                    type: string
 *                    description: Description of the survey
 *                  is_active:
 *                    type: boolean
 *                    description: Whether the survey is active
 *                  survey_start:
 *                    type: string
 *                    format: date-time
 *                    description: Start date and time of the survey
 *                  survey_end:
 *                    type: string
 *                    format: date-time
 *                    description: End date and time of the survey
 *                  is_shared:
 *                    type: boolean
 *                    description: Whether the survey is shared
 *                  allowed_user_groups:
 *                    type: object
 *                    description: JSON object of allowed user groups
 *       404:
 *         description: Survey not found
 *       500:
 *         description: Database query failed
 */
app.get("/surveys/:survey_id", (req, res) => {
  const surveyId = parseInt(req.params.survey_id);
  db.query(
    "SELECT * FROM Surveys WHERE survey_id = ?",
    [surveyId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.status(200).json(results[0]);
    }
  );
});

// Create a new survey
/**
 * @swagger
 * /surveys:
 *   post:
 *     summary: Create a new survey
 *     tags:
 *       - Surveys
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organisation_id
 *               - created_by
 *               - title
 *             properties:
 *               organisation_id:
 *                 type: integer
 *                 description: ID of the organisation
 *               created_by:
 *                 type: integer
 *                 description: ID of the user who created the survey
 *               title:
 *                 type: string
 *                 description: Title of the survey
 *               description:
 *                 type: string
 *                 description: Description of the survey
 *               is_active:
 *                 type: boolean
 *                 description: Whether the survey is active
 *               survey_start:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the survey
 *               survey_end:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the survey
 *               is_shared:
 *                 type: boolean
 *                 description: Whether the survey is shared
 *               allowed_user_groups:
 *                 type: object
 *                 description: JSON object of allowed user groups
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 survey_id:
 *                   type: integer
 *                   description: ID of the created survey
 *                 organisation_id:
 *                   type: integer
 *                   description: ID of the organisation
 *                 created_by:
 *                   type: integer
 *                   description: ID of the user who created the survey
 *                 title:
 *                   type: string
 *                   description: Title of the survey
 *                 description:
 *                   type: string
 *                   description: Description of the survey
 *                 is_active:
 *                   type: boolean
 *                   description: Whether the survey is active
 *                 survey_start:
 *                   type: string
 *                   format: date-time
 *                   description: Start date and time of the survey
 *                 survey_end:
 *                   type: string
 *                   format: date-time
 *                   description: End date and time of the survey
 *                 is_shared:
 *                   type: boolean
 *                   description: Whether the survey is shared
 *                 allowed_user_groups:
 *                   type: object
 *                   description: JSON object of allowed user groups
 *       400:
 *         description: Bad request, title is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Database query failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.post("/surveys", (req, res) => {
  const {
    organisation_id,
    created_by,
    title,
    description,
    is_active,
    survey_start,
    survey_end,
    is_shared,
    allowed_user_groups,
  } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  db.query(
    "INSERT INTO Surveys (organisation_id, created_by, title, description, is_active, survey_start, survey_end, is_shared, allowed_user_groups) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      organisation_id,
      created_by,
      title,
      description,
      is_active,
      survey_start,
      survey_end,
      is_shared,
      allowed_user_groups,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(201).json({
        survey_id: results.insertId,
        organisation_id,
        created_by,
        title,
        description,
        is_active,
        survey_start,
        survey_end,
        is_shared,
        allowed_user_groups,
      });
    }
  );
});

// Update an existing survey
/**
 * @swagger
 * /surveys/{survey_id}:
 *   put:
 *     summary: Update an existing survey
 *     tags:
 *       - Surveys
 *     parameters:
 *       - in: path
 *         name: survey_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the survey to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organisation_id:
 *                 type: integer
 *                 description: ID of the organisation
 *               created_by:
 *                 type: integer
 *                 description: ID of the user who created the survey
 *               title:
 *                 type: string
 *                 description: Title of the survey
 *               description:
 *                 type: string
 *                 description: Description of the survey
 *               is_active:
 *                 type: boolean
 *                 description: Whether the survey is active
 *               survey_start:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the survey
 *               survey_end:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the survey
 *               is_shared:
 *                 type: boolean
 *                 description: Whether the survey is shared
 *               allowed_user_groups:
 *                 type: object
 *                 description: JSON object of allowed user groups
 *     responses:
 *       200:
 *         description: Survey updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 survey_id:
 *                   type: integer
 *                   description: ID of the updated survey
 *                 organisation_id:
 *                   type: integer
 *                   description: ID of the organisation
 *                 created_by:
 *                   type: integer
 *                   description: ID of the user who created the survey
 *                 title:
 *                   type: string
 *                   description: Title of the survey
 *                 description:
 *                   type: string
 *                   description: Description of the survey
 *                 is_active:
 *                   type: boolean
 *                   description: Whether the survey is active
 *                 survey_start:
 *                   type: string
 *                   format: date-time
 *                   description: Start date and time of the survey
 *                 survey_end:
 *                   type: string
 *                   format: date-time
 *                   description: End date and time of the survey
 *                 is_shared:
 *                   type: boolean
 *                   description: Whether the survey is shared
 *                 allowed_user_groups:
 *                   type: object
 *                   description: JSON object of allowed user groups
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Database query failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
app.put("/surveys/:survey_id", (req, res) => {
  const surveyId = parseInt(req.params.survey_id);
  const {
    organisation_id,
    created_by,
    title,
    description,
    is_active,
    survey_start,
    survey_end,
    is_shared,
    allowed_user_groups,
  } = req.body;
  db.query(
    "UPDATE Surveys SET organisation_id = ?, created_by = ?, title = ?, description = ?, is_active = ?, survey_start = ?, survey_end = ?, is_shared = ?, allowed_user_groups = ? WHERE survey_id = ?",
    [
      organisation_id,
      created_by,
      title,
      description,
      is_active,
      survey_start,
      survey_end,
      is_shared,
      allowed_user_groups,
      surveyId,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.status(200).json({
        survey_id: surveyId,
        organisation_id,
        created_by,
        title,
        description,
        is_active,
        survey_start,
        survey_end,
        is_shared,
        allowed_user_groups,
      });
    }
  );
});

// Delete a survey
/**
 * @swagger
 * /surveys/{survey_id}:
 *   delete:
 *     summary: Delete a survey
 *     parameters:
 *       - in: path
 *         name: survey_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the survey to delete
 *     responses:
 *       204:
 *         description: Survey deleted successfully
 *       404:
 *         description: Survey not found
 *       500:
 *         description: Database query failed
 */
app.delete("/surveys/:survey_id", (req, res) => {
  const surveyId = parseInt(req.params.survey_id);
  db.query(
    "DELETE FROM Surveys WHERE survey_id = ?",
    [surveyId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.status(204).send();
    }
  );
});

// Get all surveys created by a user
/**
 * @swagger
 * /surveys/users/{user_id}:
 *   get:
 *     summary: Retrieve surveys created by a specific user
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of surveys created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   survey_id:
 *                     type: integer
 *                     description: ID of the updated survey
 *                   organisation_id:
 *                     type: integer
 *                     description: ID of the organisation
 *                   created_by:
 *                     type: integer
 *                     description: ID of the user who created the survey
 *                   title:
 *                     type: string
 *                     description: Title of the survey
 *                   description:
 *                     type: string
 *                     description: Description of the survey
 *                   is_active:
 *                     type: boolean
 *                     description: Whether the survey is active
 *                   survey_start:
 *                     type: string
 *                     format: date-time
 *                     description: Start date and time of the survey
 *                   survey_end:
 *                     type: string
 *                     format: date-time
 *                     description: End date and time of the survey
 *                   is_shared:
 *                     type: boolean
 *                     description: Whether the survey is shared
 *                   allowed_user_groups:
 *                     type: object
 *                     description: JSON object of allowed user groups
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid user ID
 *       500:
 *         description: Database query failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database query failed
 */
app.get("/surveys/users/:user_id", (req, res) => {
  const userId = parseInt(req.params.user_id);
  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  db.query(
    "SELECT * FROM Surveys WHERE created_by = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(results);
    }
  );
});

// Get all surveys for an organisation
/**
 * @swagger
 * /surveys/organisations/{organisation_id}:
 *   get:
 *     summary: Retrieve surveys for a specific organisation
 *     parameters:
 *       - in: path
 *         name: organisation_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the organisation
 *     responses:
 *       200:
 *         description: A list of surveys for the organisation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   survey_id:
 *                     type: integer
 *                     description: ID of the updated survey
 *                   organisation_id:
 *                     type: integer
 *                     description: ID of the organisation
 *                   created_by:
 *                     type: integer
 *                     description: ID of the user who created the survey
 *                   title:
 *                     type: string
 *                     description: Title of the survey
 *                   description:
 *                     type: string
 *                     description: Description of the survey
 *                   is_active:
 *                     type: boolean
 *                     description: Whether the survey is active
 *                   survey_start:
 *                     type: string
 *                     format: date-time
 *                     description: Start date and time of the survey
 *                   survey_end:
 *                     type: string
 *                     format: date-time
 *                     description: End date and time of the survey
 *                   is_shared:
 *                     type: boolean
 *                     description: Whether the survey is shared
 *                   allowed_user_groups:
 *                     type: object
 *                     description: JSON object of allowed user groups
 *       400:
 *         description: Invalid organisation ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid organisation ID
 *       500:
 *         description: Database query failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database query failed
 */
app.get("/surveys/organisations/:organisation_id", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  if (!organisationId) {
    return res.status(400).json({ error: "Invalid organisation ID" });
  }
  db.query(
    "SELECT * FROM Surveys WHERE organisation_id = ?",
    [organisationId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(results);
    }
  );
});

export default app;
