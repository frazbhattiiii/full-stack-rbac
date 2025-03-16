import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Express Server',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Update this with your server URL
        description: 'Development server',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.routes.ts')], // Ensure correct path
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
