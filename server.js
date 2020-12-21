// Main server 
const http = require('http');
const app = require('./app');
const realTimeServer =require('./services/realTimeServer.js');
const cron = require('./services/cronService.js')
const server = http.createServer(app);

const PORT = process.env.PORT || 5555;

// Run the Server
const webserver = server.listen(PORT, () => {
    console.log(`Server is running successfully at PORT :- ${PORT}`);
})
realTimeServer.socketio(webserver);
