module.exports = {
    apps: [{
        name: 'n8n-screenshot-app',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        instances: 1,
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '1G',
    }]
};
