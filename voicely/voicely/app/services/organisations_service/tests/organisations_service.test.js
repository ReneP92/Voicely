import request from "supertest";

import db from "../utils/db/cnx.js";
import app from "../organisations.js";

jest.mock("../utils/db/cnx", () => {
  const dbMock = jest.requireActual("../tests/__mocks__/db");
  return dbMock;
});

// Mock app file to export the app without starting the server
// If your app file starts the server directly, you may need to refactor it.

describe("Organisation Routes", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.error
    jest.clearAllMocks();
  });

  describe("GET /organisations", () => {
    it("should return all organisations", async () => {
      const mockOrganisations = [{ organisation_id: 1, name: "TestOrg Ltd." }];
      db.query.mockImplementation((query, callback) =>
        callback(null, mockOrganisations)
      );

      const response = await request(app).get("/organisations");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrganisations);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Organisations",
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/organisations");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("POST /organisations", () => {
    it("should create a new organisation", async () => {
      const newOrganisation = {
        name: "TestOrg Ltd.",
        line_1: "123 Test St.",
        line_2: "Suite 100",
        zip_code: "12345",
        city: "Testville",
        state: "TS",
        country: "Testland",
        industry: "Test Industry",
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { insertId: 1 })
      );

      const response = await request(app)
        .post("/organisations")
        .send(newOrganisation);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        organisation_id: 1,
        ...newOrganisation,
      });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO Organisations (name, line_1, line_2, zip_code, city, state, country, industry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newOrganisation.name,
          newOrganisation.line_1,
          newOrganisation.line_2,
          newOrganisation.zip_code,
          newOrganisation.city,
          newOrganisation.state,
          newOrganisation.country,
          newOrganisation.industry,
        ],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).post("/organisations").send({
        name: "TestOrg Ltd.",
        line_1: "123 Test St.",
        line_2: "Suite 100",
        zip_code: "12345",
        city: "Testville",
        state: "TS",
        country: "Testland",
        industry: "Test Industry",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("GET /organisations/:organisation_id", () => {
    it("should return an organisation by ID", async () => {
      const mockOrganisation = { organisation_id: 1, name: "TestOrg Ltd." };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, [mockOrganisation])
      );

      const response = await request(app).get("/organisations/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrganisation);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Organisations WHERE organisation_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return 404 if the user is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, [])
      );

      const response = await request(app).get("/organisations/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Organisation not found" });
    });
  });

  describe("PUT /organisations/:organisation_id", () => {
    it("should update an existing organisation", async () => {
      const updatedOrganisation = {
        name: "Test2Org Ltd.",
        line_1: "123 Test St.",
        line_2: "Suite 100",
        zip_code: "12345",
        city: "Testville",
        state: "TS",
        country: "Testland",
        industry: "Test Industry",
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 1 })
      );

      const response = await request(app)
        .put("/organisations/1")
        .send(updatedOrganisation);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        organisation_id: 1,
        ...updatedOrganisation,
      });
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE Organisations SET name = ?, line_1 = ?, line_2 = ?, zip_code = ?, city = ?, state = ?, country = ?, industry = ? WHERE organisation_id = ?",
        [
          updatedOrganisation.name,
          updatedOrganisation.line_1,
          updatedOrganisation.line_2,
          updatedOrganisation.zip_code,
          updatedOrganisation.city,
          updatedOrganisation.state,
          updatedOrganisation.country,
          updatedOrganisation.industry,
          1,
        ],
        expect.any(Function)
      );
    });

    it("should return 404 if the user is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 0 })
      );

      const response = await request(app).put("/organisations/999").send({
        name: "Test2Org Ltd.",
        name: "Test2Org Ltd.",
        line_1: "123 Test St.",
        line_2: "Suite 100",
        zip_code: "12345",
        city: "Testville",
        state: "TS",
        country: "Testland",
        industry: "Test Industry",
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Organisation not found" });
    });
  });

  describe("DELETE /organisations/:organisation_id", () => {
    it("should delete a user", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 1 })
      );

      const response = await request(app).delete("/organisations/1");

      expect(response.status).toBe(204);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM Organisations WHERE organisation_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return 404 if the user is not found", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { affectedRows: 0 })
      );

      const response = await request(app).delete("/organisations/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Organisation not found" });
    });
  });

  describe("GET /organisations/:organisation_id/users", () => {
    it("should return all users in an organisation", async () => {
      const mockUsers = [{ user_id: 1, name: "Test User" }];
      db.query.mockImplementation((query, values, callback) =>
        callback(null, mockUsers)
      );

      const response = await request(app).get("/organisations/1/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Users WHERE organisation_id = ?",
        [1],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app).get("/organisations/1/users");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });

  describe("POST /organisations/:organisation_id/user_groups", () => {
    it("should create a new user group", async () => {
      const newUserGroup = {
        name: "Test Group",
      };
      db.query.mockImplementation((query, values, callback) =>
        callback(null, { insertId: 1 })
      );

      const response = await request(app)
        .post("/organisations/1/user_groups")
        .send(newUserGroup);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        user_group_id: 1,
        ...newUserGroup,
      });
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO User_Groups (organisation_id, name) VALUES (?, ?)",
        [1, newUserGroup.name, newUserGroup.description],
        expect.any(Function)
      );
    });

    it("should return a 500 error if the database query fails", async () => {
      db.query.mockImplementation((query, values, callback) =>
        callback(new Error("Database query failed"))
      );

      const response = await request(app)
        .post("/organisations/1/user_groups")
        .send({ name: "Test Group" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database query failed" });
    });
  });
});
