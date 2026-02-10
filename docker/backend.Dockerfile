# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files separately to leverage Docker cache
COPY package*.json ./

# Install all dependencies (including devDependencies for any build steps)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app .

# Switch to non-root user for security
RUN chown -R node:node /app
USER node

# Expose the application port
EXPOSE 3000

# Health check using a simple node script
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
