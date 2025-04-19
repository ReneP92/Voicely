const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Responses API",
      description: "Responses API Information",
      contact: {
        name: "Rene Persau",
      },
    },
    servers: [
      {
        url: "http://localhost:3004",
      },
    ],
  },
  apis: ["./responses.js"],
};

export default swaggerOptions;
