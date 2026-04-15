# Use Node.js LTS version
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (helps with faster builds/caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the auth-service code
COPY . .

# Open the port for the Auth service
EXPOSE 5001

# Command to run the service
CMD ["node", "server.js"]