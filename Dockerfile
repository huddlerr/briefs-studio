# Use official lightweight Node.js 20 image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Default host configurations
ENV PORT=4000
ENV NODE_ENV=production

# Expose the active server port
EXPOSE 4000

# Command to execute Express server
CMD ["npm", "start"]
