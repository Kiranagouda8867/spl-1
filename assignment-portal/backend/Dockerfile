# =============================================================================
# Backend Dockerfile
# Multi-stage build: dependency install + production run
# =============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files only (layer caching)
COPY package.json package-lock.json* ./

# Install production dependencies using lockfile
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 --ingroup nodejs appuser

# Copy installed production modules
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:nodejs src/ ./src/

# Copy package.json for metadata
COPY --chown=appuser:nodejs package.json ./

# Create uploads directory and set ownership
RUN mkdir -p /app/uploads && chown appuser:nodejs /app/uploads

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 5000

# Health check — uses the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Environment variables — provide via docker compose or runtime (never baked in)
# MONGODB_URI, JWT_SECRET, etc. must be injected at runtime

# Start the server
CMD ["node", "src/server.js"]
