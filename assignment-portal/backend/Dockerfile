
# ============================================
# Assignment Portal - Backend Dockerfile
# ============================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user
RUN addgroup -S nodejs -g 1001 && \
    adduser -S appuser -u 1001 -G nodejs

# Copy dependencies
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --chown=appuser:nodejs package.json ./
COPY --chown=appuser:nodejs src/ ./src/

# Create uploads directory
RUN mkdir -p /app/uploads && \
    chown -R appuser:nodejs /app/uploads

USER appuser

# Backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

# Start backend
CMD ["node", "src/server.js"]
