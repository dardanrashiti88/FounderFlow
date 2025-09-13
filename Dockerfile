# Multi-stage Dockerfile for optimal production builds
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS build-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM build-deps AS builder
WORKDIR /app
COPY . .

# Build the frontend and backend (dev deps already available)
RUN npm run build && npx tsc --project tsconfig.server.json && npx tsc-alias -p tsconfig.server.json

# Production image
FROM base AS runner
WORKDIR /app

# Create app user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --chown=appuser:nodejs package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check using wget (available in alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server/index.js"]