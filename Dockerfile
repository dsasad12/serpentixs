# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build frontend
RUN pnpm build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
COPY server/pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source files
COPY server/ .

# Generate Prisma client
RUN npx prisma generate

# Build backend
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S serpentixpay && \
    adduser -S serpentixpay -u 1001 -G serpentixpay

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder --chown=serpentixpay:serpentixpay /app/dist ./dist

# Copy backend
WORKDIR /app/server

COPY --from=backend-builder --chown=serpentixpay:serpentixpay /app/server/package*.json ./
COPY --from=backend-builder --chown=serpentixpay:serpentixpay /app/server/node_modules ./node_modules
COPY --from=backend-builder --chown=serpentixpay:serpentixpay /app/server/dist ./dist
COPY --from=backend-builder --chown=serpentixpay:serpentixpay /app/server/prisma ./prisma

# Create directories
RUN mkdir -p logs data uploads && \
    chown -R serpentixpay:serpentixpay logs data uploads

# Switch to non-root user
USER serpentixpay

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
