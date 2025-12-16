# Next.js Screenshoter App

Next.js-based application that captures website screenshots using Puppeteer.

## Installation and Setup

### Step 1: Clone or Upload Your Next.js Project

```
git clone https://github.com/yourusername/your-nextjs-project.git
cd your-nextjs-project
```

### Step 2: Install Dependencies

Run the following command to install all required dependencies:

`npm install`

### Step 3: Build the Next.js App

Build the application for production:

`npm run build`

This will generate the `.next` folder containing the production build.

### Step 4: Start the Next.js App

Run the following command to start the application:

`npm run start`

Your app will now run on [http://localhost:3000](http://localhost:3000).


## If running on a server

Fresh Clone (if not already cloned)
```
# Clone the repository
git clone https://github.com/Imperol3/N8N-SCREENSHOTS-APP.git

# Navigate into the directory
cd N8N-SCREENSHOTS-APP

# Checkout the browserless branch
git checkout browserless
```

If Already Cloned on Server
```
# Navigate to the repo
cd N8N-SCREENSHOTS-APP

# Fetch all branches
git fetch --all

# Checkout the browserless branch
git checkout browserless

# Pull latest changes
git pull origin browserless
```


After Pulling, Setup Steps

```
# 1. Install dependencies
npm install

# 2. Install puppeteer-core (for Browserless)
npm install puppeteer-core

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations (if needed)
npx prisma migrate deploy
# OR for development
npx prisma migrate dev

# 5. Build for production
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.js

# OR start with npm

npm start
````


Environment Setup
Don't forget to configure your app after deployment:

Go to http://your-server:3000/settings
Configure n8n credentials
Configure Browserless (optional) or leave empty to use local Puppeteer
The branch name is browserless - that's what you'll pull to your server!