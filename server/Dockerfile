# Single stage build for simplicity
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY src ./src

# Create database directory
RUN mkdir -p /app/database

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
