function addIndexer(chainName, configDir) {
    return {
        script: "./launcher.js",
        name: chainName + "-indexer",
        namespace: chainName,
        interpreter: 'node',
        interpreter_args: ["--max-old-space-size=4096", "--trace-deprecation"],
        autorestart: false,
        kill_timeout: 3600,
        time: true, // include timestamps in pm2 logs
        env: {
            CONFIG_DIR: configDir,
            CONFIG_JSON: path.join(configDir, 'chains', chainName + '.config.json'),
            TRACE_LOGS: 'false'
        }
    };
}

function addApiServer(chainName, configDir, threads) {
    return {
        script: "./api/server.js",
        name: chainName + "-api",
        namespace: chainName,
        node_args: ["--trace-deprecation"],
        exec_mode: 'cluster',
        merge_logs: true,
        instances: threads,
        autorestart: true,
        exp_backoff_restart_delay: 100,
        watch: ["api"],
        env: {
            CONFIG_DIR: configDir,
            CONFIG_JSON: path.join(configDir, 'chains', chainName + '.config.json'),
        }
    }
}

module.exports = {addIndexer, addApiServer};
