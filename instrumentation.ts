export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // We only want to start the scheduler in the Node.js runtime, not Edge
        const { startScheduler } = await import('@/lib/scheduler');
        startScheduler();
    }
}
