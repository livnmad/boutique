FROM node:18 AS builder
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

FROM node:18-alpine
WORKDIR /app

# Copy built server
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json

ENV NODE_ENV=production
EXPOSE 4000

RUN cd server && npm install --production --silent

CMD ["node", "server/dist/index.js"]
