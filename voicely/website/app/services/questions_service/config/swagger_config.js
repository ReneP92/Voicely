const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Questions API",
      description: "Questions API Information",
      contact: {
        name: "Rene Persau",
      },
    },
    servers: [
      {
        url: "http://localhost:3003",
      },
    ],
  },
  apis: ["./questions.js"],
};

export default swaggerOptions;
