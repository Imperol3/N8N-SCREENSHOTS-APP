FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
# Copy package files
COPY package*.json ./

# Install dependencies (only production if possible, but build needs devDeps)
# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies like Tailwind/Typescript)
# This is required for the 'npm run build' step to work.
RUN npm ci

# Copy source code
COPY . .

# Build the Typescript app
RUN npx tsc

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Chromium
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
