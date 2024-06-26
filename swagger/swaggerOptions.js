const swaggerJsDoc = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for the Express application",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
  },
  apis: ["./routes/*.js"], // API dosyalarınızın yolu
};

export default swaggerJsDoc;
