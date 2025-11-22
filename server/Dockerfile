FROM node:20 AS builder
WORKDIR /app

# Copy server and client sources
COPY server ./server
COPY client ./client

# Build client
WORKDIR /app/client
RUN npm install --silent
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm install --silent
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
