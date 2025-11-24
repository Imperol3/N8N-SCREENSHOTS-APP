import cron from 'node-cron';
import { db } from './db';
import { runScraper } from './scraper-service';

let currentTask: any = null;

export async function startScheduler() {
    console.log('Starting Scheduler Service...');

    // Initial check
    await updateSchedule();

    // Check for schedule changes every minute
    setInterval(updateSchedule, 60000);
}

async function updateSchedule() {
    try {
        const settings = await db.settings.findFirst();

        if (!settings || !settings.scheduleCron) {
            if (currentTask) {
                console.log('Stopping scheduler (no settings or cron)');
                currentTask.stop();
                currentTask = null;
            }
            return;
        }

        // If we already have a task running with the same cron, do nothing
        // For simplicity, we'll just restart it if it exists to pick up new cron
        if (currentTask) {
            currentTask.stop();
        }

        if (!cron.validate(settings.scheduleCron)) {
            console.error('Invalid Cron Expression:', settings.scheduleCron);
            return;
        }

        console.log(`Scheduling scraper with cron: ${settings.scheduleCron}`);
        currentTask = cron.schedule(settings.scheduleCron, async () => {
            console.log('Running scheduled scrape...');
            try {
                if (!settings.n8nUrl || !settings.email || !settings.password) {
                    console.log('Missing credentials, skipping scrape');
                    return;
                }

                console.log('Scraping...');

                await runScraper({
                    siteUrl: settings.n8nUrl,
                    email: settings.email,
                    password: settings.password,
                    workflowUrl: settings.n8nUrl + '/workflows',
                    showBrowser: false,
                });

            } catch (error) {
                console.error('Scheduled scrape failed:', error);
            }
        });
    } catch (error) {
        console.error('Scheduler update failed:', error);
    }
}
