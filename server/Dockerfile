FROM node:20 AS builder
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies (these layers will be cached if package.json doesn't change)
WORKDIR /app/client
RUN npm install --silent

WORKDIR /app/server
RUN npm ci --silent

# Copy source files AFTER installing dependencies
WORKDIR /app
COPY server ./server
COPY client ./client

# Build client
WORKDIR /app/client
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Copy built server and client
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/client/dist ./client/dist

# Install production dependencies
WORKDIR /app/server
RUN npm ci --production --silent

WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3020

CMD ["node", "server/dist/index.js"]
