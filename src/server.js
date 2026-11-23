const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { connectDatabase } = require('./config/database');
const { initSocket } = require('./sockets/index');

const server = http.createServer(app);

initSocket(server);

connectDatabase().then(() => {
  server.listen(config.port, () => {
    console.log(`OLC Backend running on port ${config.port} (${config.env})`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = server;
