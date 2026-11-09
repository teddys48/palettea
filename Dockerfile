# syntax=docker/dockerfile:1

# Stage 1: Build stage with official Bun image
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Copy dependency definition and lockfile
COPY package.json bun.lock ./

# Install dependencies strictly from lockfile
RUN bun install --frozen-lockfile

# Copy application source code and configurations
COPY . .

# Run static checks and production build
RUN bun run check && bun run build

# Stage 2: Production runtime with lightweight unprivileged Nginx
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

# Copy custom unprivileged Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

# Expose unprivileged port (8080)
EXPOSE 8080

# Healthcheck to verify the web server is answering
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start Nginx in foreground as non-root user
CMD ["nginx", "-g", "daemon off;"]
