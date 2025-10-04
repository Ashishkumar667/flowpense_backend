# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (better caching for dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of the application code
COPY . .

# Expose the app port
EXPOSE 4000

# Run the application
CMD ["npm", "start"]
