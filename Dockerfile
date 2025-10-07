# Multi-stage Dockerfile for Next.js 15
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# If you use a non-root user in your environment, you can uncomment the following lines
# RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
# USER nextjs

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "run", "start"]
