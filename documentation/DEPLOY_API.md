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

## Deploying on Coolify

Since this app requires specific Docker flags (`shm_size`, `cap_add`) for the browser to run correctly, follow these steps:

1.  **Create New Resource** -> **Project** -> **Production**.
2.  Select **Git Repository** (Public or Private).
3.  Enter the Repo URL: `https://github.com/Imperol3/N8N-SCREENSHOTS-APP`.
4.  **Important:** Change the **Branch** to `API`.
5.  **Build Pack:** Select **Docker Compose**.
    *   *Why?* The `docker-compose.yml` file contains critical settings (`shm_size: 1gb`) that prevent the browser from crashing.
6.  **Deploy.**
7.  Coolify will automatically detect the port `3000` from the compose file and set up the domain.
