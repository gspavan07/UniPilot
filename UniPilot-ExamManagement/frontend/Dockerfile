# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files (using a relative path from build context or explicit path)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build args for environment variables
ARG VITE_API_URL
ARG VITE_MAIN_API_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAIN_API_URL=$VITE_MAIN_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (ensure this file exists in the context or create one)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
