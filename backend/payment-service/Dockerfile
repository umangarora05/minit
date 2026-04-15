# Use Node.js 20 Alpine for efficiency
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the source code (config, models, kafka consumers)
COPY . .

# Expose the Payment Port
EXPOSE 5005

# Start the service
CMD ["node", "server.js"]