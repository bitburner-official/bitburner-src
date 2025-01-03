# Stage 1: Build the application
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary tools, including git
RUN apk add --no-cache git
# Copy dependencies
COPY package.json package-lock.json ./
COPY tools/ ./tools

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# Pass the build mode as a build argument (default to production)
ARG BUILD_MODE=production
RUN npx webpack --mode ${BUILD_MODE}

# Prepare the build artifacts
RUN mkdir -p .app && \
    cp index.html favicon.ico .app && \
    cp -r dist .app

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine AS runtime

# Security optimizations
RUN chmod -R 644 /etc/nginx/nginx.conf

# Copy the built application from the builder stage
COPY --from=builder /app/.app /usr/share/nginx/html

# Set permissions for security
RUN chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
