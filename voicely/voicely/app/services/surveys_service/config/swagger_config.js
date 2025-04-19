const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Surveys API",
      description: "Surveys API Information",
      contact: {
        name: "Rene Persau",
      },
    },
    servers: [
      {
        url: "http://localhost:3002",
      },
    ],
  },
  apis: ["./surveys.js"],
};

export default swaggerOptions;
