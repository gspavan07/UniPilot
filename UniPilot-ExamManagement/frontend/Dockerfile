# Build stage
FROM node:24-alpine as builder

WORKDIR /app

# Copy package files (using a relative path from build context or explicit path)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
