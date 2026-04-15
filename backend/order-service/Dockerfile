# Use Node.js 20 Alpine for a small, secure footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the order-service source code
COPY . .

# Expose the Order Service port (Standard: 5002)
EXPOSE 5002

# Start the service
CMD ["node", "server.js"]