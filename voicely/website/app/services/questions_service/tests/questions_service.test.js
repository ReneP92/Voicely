import request from "supertest";

import db from "../utils/db/cnx.js";
import app from "../questions.js";

jest.mock("../utils/db/cnx", () => {
  const dbMock = jest.requireActual("../tests/__mocks__/db");
  return dbMock;
});
// Mock app file to export the app without starting the server
// If your app file starts the server directly, you may need to refactor it.

describe("Questions Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.error
    jest.clearAllMocks();
  });

  describe("GET /surveys/:survey_id/questions", () => {
    it("should return questions of a survey", async () => {
      const mockQuestions = [
        {
          question_id: 1,
          survey_id: 1,
          question_text: "How are you?",
          question_type: "short_answer",
          required: true,
        },
      ];
      db.query.mockImplementation((query, values, callback) =>
        callback(null, mockQuestions)
      );

      const response = await request(app).get("/surveys/1/questions");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Questions WHERE survey_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/surveys/1/questions");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("POST /surveys/:survey_id/questions", () => {
    it("should create a new question", async () => {
      const newQuestion = {
        question_text: "How are you?",
        question_type: "short_answer",
        required: true,
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { insertId: 1 })
      );

      const response = await request(app)
        .post("/surveys/1/questions")
        .send(newQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ question_id: 1 });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO Questions (survey_id, question_text, question_type, required) VALUES (?, ?, ?, ?)",
        [1, "How are you?", "short_answer", true],
        expect.any(Function)
      );
    });

    it("should return a 400 error if question_text, question_type, and required are missing", async () => {
      const newQuestion = {};
      const response = await request(app)
        .post("/surveys/1/questions")
        .send(newQuestion);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          "survey_id, question_text, question_type, and required are required",
      });
    });

    it("should return a 500 error if the database query fails", async () => {
      const newQuestion = {
        question_text: "How are you?",
        question_type: "short_answer",
        required: true,
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app)
        .post("/surveys/1/questions")
        .send(newQuestion);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("PUT /questions/:question_id", () => {
    it("should update a question", async () => {
      const updatedQuestion = {
        question_text: "How are you today?",
        question_type: "short_answer",
        required: false,
      };
      db.query.mockImplementation((query, values, callback) => callback(null));

      const response = await request(app)
        .put("/questions/1")
        .send(updatedQuestion);

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE Questions SET question_text = ?, question_type = ?, required = ? WHERE question_id = ?",
        ["How are you today?", "short_answer", false, 1],
        expect.any(Function)
      );
    });

    it("should return a 400 error if question_text, question_type, and required are missing", async () => {
      const updatedQuestion = {};
      const response = await request(app)
        .put("/questions/1")
        .send(updatedQuestion);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          "question_id, question_text, question_type, and required are required",
      });
    });

    it("should return a 500 error if the database query fails", async () => {
      const updatedQuestion = {
        question_text: "How are you today?",
        question_type: "short_answer",
        required: false,
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app)
        .put("/questions/1")
        .send(updatedQuestion);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("DELETE /questions/:question_id", () => {
    it("should delete a question", async () => {
      db.query.mockImplementation((query, values, callback) => callback(null));

      const response = await request(app).delete("/questions/1");

      expect(response.status).toBe(204);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM Questions WHERE question_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).delete("/questions/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });
});
