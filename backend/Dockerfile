# Step 1: Use lightweight Node.js LTS Alpine image
FROM node:18-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy dependency definitions
COPY package*.json ./

# Step 4: Install production dependencies
RUN npm ci --only=production

# Step 5: Copy application source code
COPY . .

# Step 6: Expose Express port
EXPOSE 5000

# Step 7: Start production server
CMD ["node", "src/server.js"]