FROM node:18-alpine

WORKDIR /app

# Define build arguments
ARG NODE_ENV=production
ARG PORT=3001

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE $PORT
CMD ["npm", "start"]