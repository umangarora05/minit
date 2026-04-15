# Use the same Node version as your other services for consistency
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (only production to keep image small)
RUN npm install

# Copy all files from the admin-service folder
COPY . .

# Expose the port defined in your server.js (suggested: 5006)
EXPOSE 5006

# Start the admin server
CMD ["node", "server.js"]