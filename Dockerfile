# Stage 1: Build the application
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary tools, including git
RUN apk update && \
    apk add --no-cache git && \
    apk add bash

# Copy dependencies
COPY package.json package-lock.json ./
COPY tools/ ./tools

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# Pass the build mode as a build argument
ARG BUILD_MODE
# Use shell logic to determine which version to install
RUN if [ "$BUILD_MODE" = "dev" ]; then \
    echo "Installing development version"; \
    npm run build:dev; \
    else \
    echo "Installing production version"; \
    npm run build; \
    fi

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
