import request from "supertest";

import db from "../utils/db/cnx.js";
import app from "../responses.js";

jest.mock("../utils/db/cnx", () => {
  const dbMock = jest.requireActual("../tests/__mocks__/db");
  return dbMock;
});
// Mock app file to export the app without starting the server
// If your app file starts the server directly, you may need to refactor it.

describe("Responses Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.error
    jest.clearAllMocks();
  });

  describe("GET /responses:response_id", () => {
    it("should return a response by ID", async () => {
      const mockResponse = [
        {
          response_id: 1,
          survey_id: 1,
          participant_id: 12345,
        },
      ];
      db.query.mockImplementation((query, params, callback) =>
        callback(null, mockResponse)
      );

      const response = await request(app).get("/responses/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Responses WHERE response_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 404 error if the response is not found", async () => {
      db.query.mockImplementation((query, params, callback) =>
        callback(null, [])
      );

      const response = await request(app).get("/responses/1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Response not found" });
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Responses WHERE response_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, params, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/responses/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Responses WHERE response_id = ?",
        [1],
        expect.any(Function)
      );
    });
  });

  describe("DELETE /responses:response_id", () => {
    it("should delete a response by ID", async () => {
      db.query.mockImplementation((query, params, callback) => callback(null));

      const response = await request(app).delete("/responses/1");

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM Responses WHERE response_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, params, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).delete("/responses/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM Responses WHERE response_id = ?",
        [1],
        expect.any(Function)
      );
    });
  });

  describe("GET /surveys/:survey_id/responses", () => {
    it("should return all responses for a survey", async () => {
      const mockResponses = [
        {
          response_id: 1,
          survey_id: 1,
          participant_id: 12345,
        },
        {
          response_id: 2,
          survey_id: 1,
          participant_id: 12346,
        },
      ];
      db.query.mockImplementation((query, params, callback) =>
        callback(null, mockResponses)
      );

      const response = await request(app).get("/surveys/1/responses");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponses);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Responses WHERE survey_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, params, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/surveys/1/responses");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Responses WHERE survey_id = ?",
        [1],
        expect.any(Function)
      );
    });
  });

  describe("POST /surveys/:survey_id/responses", () => {
    it("should submit a response", async () => {
      const mockResponse = {
        survey_id: 1,
        participant_id: 12345,
      };
      db.query.mockImplementation((query, params, callback) =>
        callback(null, mockResponse)
      );

      const response = await request(app)
        .post("/surveys/1/responses")
        .send(mockResponse);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO Responses (survey_id, participant_id) VALUES (?, ?)",
        [1, 12345],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      const mockResponse = {
        survey_id: 1,
        participant_id: 12345,
      };
      db.query.mockImplementation((query, params, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app)
        .post("/surveys/1/responses")
        .send(mockResponse);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO Responses (survey_id, participant_id) VALUES (?, ?)",
        [1, 12345],
        expect.any(Function)
      );
    });
  });
});
