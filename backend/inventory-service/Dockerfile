# Step 1: Use a lightweight Node.js image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package management files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy the application source code
# This includes your src/models/Product.js and src/config/kafka.js
COPY . .

# Step 6: Expose the Inventory Port
EXPOSE 5003

# Step 7: Run the application
CMD ["node", "server.js"]