import request from "supertest";

import db from "../utils/db/cnx.js";
import app from "../users.js";

jest.mock("../utils/db/cnx", () => {
  const dbMock = jest.requireActual("../tests/__mocks__/db");
  return dbMock;
});

// Mock app file to export the app without starting the server
// If your app file starts the server directly, you may need to refactor it.

describe("User Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.error
    jest.clearAllMocks();
  });

  describe("GET /users", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { user_id: 1, name: "Alice", email: "alice@example.com" },
      ];
      db.query.mockImplementation((query, callback) =>
        callback(null, mockUsers)
      );

      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Users",
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/users");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("GET /users/:user_id", () => {
    it("should return a user by ID", async () => {
      const mockUser = {
        user_id: 1,
        name: "Alice",
        email: "alice@example.com",
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, [mockUser])
      );

      const response = await request(app).get("/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Users WHERE user_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return 404 if the user is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, [])
      );

      const response = await request(app).get("/users/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });
  });

  describe("PUT /users/:user_id", () => {
    it("should update an existing user", async () => {
      const updatedUser = { name: "Charlie", email: "charlie@example.com" };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 1 })
      );

      const response = await request(app).put("/users/1").send(updatedUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ user_id: 1, ...updatedUser });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE Users SET name = ?, email = ? WHERE user_id = ?",
        [updatedUser.name, updatedUser.email, 1],
        expect.any(Function)
      );
    });

    it("should return 404 if the user is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 0 })
      );

      const response = await request(app)
        .put("/users/999")
        .send({ name: "Charlie", email: "charlie@example.com" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });
  });

  describe("DELETE /users/:user_id", () => {
    it("should delete a user", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 1 })
      );

      const response = await request(app).delete("/users/1");

      expect(response.status).toBe(204);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM Users WHERE user_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return 404 if the user is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 0 })
      );

      const response = await request(app).delete("/users/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });
  });
});
