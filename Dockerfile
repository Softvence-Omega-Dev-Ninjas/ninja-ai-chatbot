# Use Node.js 24-slim image
FROM node:24-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt update && apt install -y curl

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
