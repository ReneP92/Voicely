import request from "supertest";

import db from "../utils/db/cnx.js";
import app from "../surveys.js";

jest.mock("../utils/db/cnx", () => {
  const dbMock = jest.requireActual("../tests/__mocks__/db");
  return dbMock;
});

// Mock app file to export the app without starting the server
// If your app file starts the server directly, you may need to refactor it.

describe("Survey Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.error
    jest.clearAllMocks();
  });

  describe("GET /surveys", () => {
    it("should return all surveys", async () => {
      const mockSurveys = [
        {
          survey_id: 1,
          organisation_id: 1,
          created_by: 12345,
          title: "Survey 1",
          description: "Description 1",
          is_active: true,
          survey_start: "2021-01-01",
          survey_end: "2021-01-31",
          is_shared: true,
          allowed_user_groups: ["test_group_1", "test_group_2"],
        },
      ];
      db.query.mockImplementation((query, callback) =>
        callback(null, mockSurveys)
      );

      const response = await request(app).get("/surveys");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSurveys);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Surveys",
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/surveys");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("GET /surveys/:survey_id", () => {
    it("should return a survey by ID", async () => {
      const mockSurvey = {
        survey_id: 1,
        organisation_id: 1,
        created_by: 12345,
        title: "Survey 1",
        description: "Description 1",
        is_active: true,
        survey_start: "2021-01-01",
        survey_end: "2021-01-31",
        is_shared: true,
        allowed_user_groups: ["test_group_1", "test_group_2"],
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, [mockSurvey])
      );

      const response = await request(app).get("/surveys/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSurvey);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Surveys WHERE survey_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return 404 if the survey is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, [])
      );

      const response = await request(app).get("/surveys/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Survey not found" });
    });
  });

  describe("PUT /surveys/:survey_id", () => {
    it("should update an existing survey", async () => {
      const updatedSurvey = {
        organisation_id: 1,
        created_by: 12345,
        title: "Survey 1",
        description: "Description 1",
        is_active: true,
        survey_start: "2021-01-01",
        survey_end: "2021-01-31",
        is_shared: true,
        allowed_user_groups: ["test_group_1", "test_group_2"],
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 1 })
      );

      const response = await request(app).put("/surveys/1").send(updatedSurvey);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ survey_id: 1, ...updatedSurvey });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE Surveys SET organisation_id = ?, created_by = ?, title = ?, description = ?, is_active = ?, survey_start = ?, survey_end = ?, is_shared = ?, allowed_user_groups = ? WHERE survey_id = ?",
        [
          updatedSurvey.organisation_id,
          updatedSurvey.created_by,
          updatedSurvey.title,
          updatedSurvey.description,
          updatedSurvey.is_active,
          updatedSurvey.survey_start,
          updatedSurvey.survey_end,
          updatedSurvey.is_shared,
          updatedSurvey.allowed_user_groups,
          1,
        ],
        expect.any(Function)
      );
    });

    it("should return 404 if the survey is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 0 })
      );

      const response = await request(app)
        .put("/surveys/999")
        .send({
          organisation_id: 1,
          created_by: 12345,
          title: "Updated Survey",
          description: "Updated Description",
          is_active: true,
          survey_start: "2021-02-01",
          survey_end: "2021-02-28",
          is_shared: true,
          allowed_user_groups: ["test_group_1", "test_group_2"],
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Survey not found" });
    });
  });

  describe("DELETE /surveys/:survey_id", () => {
    it("should delete a survey", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 1 })
      );

      const response = await request(app).delete("/surveys/1");

      expect(response.status).toBe(204);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM Surveys WHERE survey_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return 404 if the survey is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 0 })
      );

      const response = await request(app).delete("/surveys/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Survey not found" });
    });
  });

  describe("GET /surveys/users/:user_id", () => {
    it("should return all surveys for a user", async () => {
      const mockSurveys = [
        {
          survey_id: 1,
          organisation_id: 1,
          created_by: 12345,
          title: "Survey 1",
          description: "Description 1",
          is_active: true,
          survey_start: "2021-01-01",
          survey_end: "2021-01-31",
          is_shared: true,
          allowed_user_groups: ["test_group_1", "test_group_2"],
        },
      ];
      db.query.mockImplementation((query, values, callback) =>
        callback(null, mockSurveys)
      );

      const response = await request(app).get("/surveys/users/12345");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSurveys);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Surveys WHERE created_by = ?",
        [12345],
        expect.any(Function)
      );
    });
  });
});
