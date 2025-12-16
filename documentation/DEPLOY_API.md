# Deploying the n8n Screenshot API

This guide connects to the `API` branch, which contains the lightweight, stateless Express server.

## Prerequisites
- Docker & Docker Compose installed on your server.
- Git.

## Deployment Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Imperol3/N8N-SCREENSHOTS-APP.git
   cd N8N-SCREENSHOTS-APP
   ```

2. **Switch to the API Branch**
   ```bash
   git checkout API
   ```

3. **Start the Service**
   Run the following command to build and start the container in the background:
   ```bash
   docker-compose up --build -d
   ```

## Verification
- The API will be available at `http://your-server-ip:3000`.
- Visit the root URL to see the status page: "Status: Active".
- Send a test POST request to `/api/scraper`.

## Updates
To update the code in the future:
```bash
git pull origin API
docker-compose up --build -d
```
