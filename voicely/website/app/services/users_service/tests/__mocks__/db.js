// db.js
const db = {
  connect: jest.fn((callback) => callback(null)),
  query: jest.fn(),
  end: jest.fn(),
};
  
export default db;