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

// Get all organisations
/**
 * @swagger
 * /organisations:
 *  get:
 *      summary: Retrieve a list of organisations
 *      responses:
 *         200:
 *          description: A list of organisations
 *          content:
 *              application/json:
 *                  schema:
 *                  type: array
 *                  items:
 *                      type: object
 *                      properties:
 *                          organisation_id:
 *                              type: integer
 *                          name:
 *                              type: string
 *                          line_1:
 *                              type: string
 *                          line_2:
 *                              type: string
 *                          zip_code:
 *                              type: string
 *                          city:
 *                              type: string
 *                          state:
 *                              type: string
 *                          country:
 *                              type: string
 *                          industry:
 *                              type: string
 */
app.get("/organisations", (req, res) => {
  db.query("SELECT * FROM Organisations", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json(results);
  });
});

// Get a single organisation by ID
/**
 * @swagger
 * /organisations/{organisation_id}:
 *  get:
 *      summary: Retrieve a single organisation by ID
 *      parameters:
 *          - in: path
 *            name: organisation_id
 *            required: true
 *            schema:
 *              type: integer
 *            description: The ID of the organisation to retrieve
 *      responses:
 *         200:
 *          description: A single organisation
 *          content:
 *              application/json:
 *                  schema:
 *                  type: object
 *                  properties:
 *                      organisation_id:
 *                          type: integer
 *                      name:
 *                          type: string
 *                      line_1:
 *                          type: string
 *                      line_2:
 *                          type: string
 *                      zip_code:
 *                          type: string
 *                      city:
 *                          type: string
 *                      state:
 *                          type: string
 *                      country:
 *                          type: string
 *                      industry:
 *                          type: string
 *         404:
 *          description: Organisation not found
 */
app.get("/organisations/:organisation_id", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  db.query(
    "SELECT * FROM Organisations WHERE organisation_id = ?",
    [organisationId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Organisation not found" });
      }
      res.status(200).json(results[0]);
    }
  );
});

// Create a new organisation
/**
 * @swagger
 * /organisations:
 *  post:
 *      summary: Create a new organisation
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                      line_1:
 *                          type: string
 *                      line_2:
 *                          type: string
 *                      zip_code:
 *                          type: string
 *                      city:
 *                          type: string
 *                      state:
 *                          type: string
 *                      country:
 *                          type: string
 *                      industry:
 *                          type: string
 *      responses:
 *         201:
 *          description: Organisation created
 *          content:
 *              application/json:
 *                  schema:
 *                  type: object
 *                  properties:
 *                      organisation_id:
 *                          type: integer
 *                      name:
 *                          type: string
 *                      line_1:
 *                          type: string
 *                      line_2:
 *                          type: string
 *                      zip_code:
 *                          type: string
 *                      city:
 *                          type: string
 *                      state:
 *                          type: string
 *                      country:
 *                          type: string
 *                      industry:
 *                          type: string
 *         400:
 *          description: Name is required
 */
app.post("/organisations", (req, res) => {
  const { name, line_1, line_2, zip_code, city, state, country, industry } =
    req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  db.query(
    "INSERT INTO Organisations (name, line_1, line_2, zip_code, city, state, country, industry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, line_1, line_2, zip_code, city, state, country, industry],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(201).json({
        organisation_id: results.insertId,
        name,
        line_1,
        line_2,
        zip_code,
        city,
        state,
        country,
        industry,
      });
    }
  );
});

// Update an existing organisation
/**
 * @swagger
 * /organisations/{organisation_id}:
 *  put:
 *      summary: Update an existing organisation
 *      parameters:
 *          - in: path
 *            name: organisation_id
 *            required: true
 *            schema:
 *              type: integer
 *            description: The ID of the organisation to update
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                      line_1:
 *                          type: string
 *                      line_2:
 *                          type: string
 *                      zip_code:
 *                          type: string
 *                      city:
 *                          type: string
 *                      state:
 *                          type: string
 *                      country:
 *                          type: string
 *                      industry:
 *                          type: string
 *      responses:
 *         200:
 *          description: Organisation updated
 *          content:
 *              application/json:
 *                  schema:
 *                  type: object
 *                  properties:
 *                      organisation_id:
 *                          type: integer
 *                      name:
 *                          type: string
 *                      line_1:
 *                          type: string
 *                      line_2:
 *                          type: string
 *                      zip_code:
 *                          type: string
 *                      city:
 *                          type: string
 *                      state:
 *                          type: string
 *                      country:
 *                          type: string
 *                      industry:
 *                          type: string
 *        400:
 *          description: Name is required
 *        404:
 *          description: Organisation not found
 */
app.put("/organisations/:organisation_id", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  if (!organisationId) {
    return res.status(400).json({ error: "organisation_id is required" });
  }
  const { name, line_1, line_2, zip_code, city, state, country, industry } =
    req.body;
  db.query(
    "UPDATE Organisations SET name = ?, line_1 = ?, line_2 = ?, zip_code = ?, city = ?, state = ?, country = ?, industry = ? WHERE organisation_id = ?",
    [
      name,
      line_1,
      line_2,
      zip_code,
      city,
      state,
      country,
      industry,
      organisationId,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Organisation not found" });
      }
      res.status(200).json({
        organisation_id: organisationId,
        name,
        line_1,
        line_2,
        zip_code,
        city,
        state,
        country,
        industry,
      });
    }
  );
});

// Delete an organisation
/**
 * @swagger
 * /organisations/{organisation_id}:
 *  delete:
 *      summary: Delete an organisation
 *      parameters:
 *          - in: path
 *            name: organisation_id
 *            required: true
 *            schema:
 *              type: integer
 *            description: The ID of the organisation to delete
 *      responses:
 *         200:
 *          description: Organisation deleted
 *         404:
 *          description: Organisation not found
 */
app.delete("/organisations/:organisation_id", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  if (!organisationId) {
    return res.status(400).json({ error: "organisation_id is required" });
  }
  db.query(
    "DELETE FROM Organisations WHERE organisation_id = ?",
    [organisationId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Organisation not found" });
      }
      res.status(204).send();
    }
  );
});

// Get all users for an organisation
/**
 * @swagger
 * /organisations/{organisation_id}/users:
 * get:
 *      summary: Retrieve a list of users for an organisation
 *      parameters:
 *        - in: path
 *          name: organisation_id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The ID of the organisation to retrieve users for
 *      responses:
 *        200:
 *          description: A list of users
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *              items:
 *                type: object
 *                properties:
 *                  user_id:
 *                    type: integer
 *                  organisation_id:
 *                    type: integer
 *                  first_name:
 *                    type: string
 *                  last_name:
 *                    type: string
 *                  email:
 *                    type: string
 *                  role:
 *                    type: string
 *        400:
 *          description: Organisation ID is required
 *        404:
 *          description: Organisation not found
 *        500:
 *         description: Database query failed
 */
app.get("/organisations/:organisation_id/users", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  if (!organisationId) {
    return res.status(400).json({ error: "organisation_id is required" });
  }
  db.query(
    "SELECT * FROM Users WHERE organisation_id = ?",
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

// Create a new user group for an organisation
/**
 * @swagger
 * /organisations/{organisation_id}/user_groups:
 *  post:
 *    summary: Create a new user group for an organisation
 *    parameters:
 *      - in: path
 *        name: organisation_id
 *        required: true
 *        schema:
 *          type: integer
 *          description: The ID of the organisation to create a user group for
 *    requestBody:
 *      required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description:
 *                    type: string
 *    responses:
 *      201:
 *        description: User group created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_group_id:
 *                  type: integer
 *                name:
 *                  type: string
 *      400:
 *        description: Name is required
 *      500:
 *        description: Database query failed
 */
app.post("/organisations/:organisation_id/user_groups", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  if (!organisationId) {
    return res.status(400).json({ error: "organisation_id is required" });
  }
  const { name } = req.body;
  db.query(
    "INSERT INTO User_Groups (organisation_id, name) VALUES (?, ?)",
    [organisationId, name],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(201).json({ user_group_id: results.insertId, name });
    }
  );
});

// Get all user groups for an organisation
/**
 * @swagger
 * /organisations/{organisation_id}/user_groups:
 *  get:
 *    summary: Retrieve a list of user groups for an organisation
 *    parameters:
 *      - in: path
 *        name: organisation_id
 *        required: true
 *        schema:
 *          type: integer
 *          description: The ID of the organisation to retrieve user groups for
 *    responses:
 *      200:
 *        description: A list of user groups
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    user_group_id:
 *                      type: integer
 *                    organisation_id:
 *                      type: integer
 *                    name:
 *                      type: string
 *      400:
 *        description: Organisation ID is required
 *      500:
 *        description: Database query failed
 */
app.get("/organisations/:organisation_id/user_groups", (req, res) => {
  const organisationId = parseInt(req.params.organisation_id);
  if (!organisationId) {
    return res.status(400).json({ error: "organisation_id is required" });
  }
  db.query(
    "SELECT * FROM User_Groups WHERE organisation_id = ?",
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
