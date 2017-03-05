const fs = require('fs');
const path = require('path');
const DEFAULT_CONFIG_PATH = path.join(__dirname, './default');

const config = {
    port: process.env.BACKEND_PORT | 8081,
    websocketPort: process.env.BACKEND_WEBSOCKET_PORT | 8082,
    usbPort: process.env.USB_PORT || 'com3',
    configPath: process.env.CONFIG_PATH || DEFAULT_CONFIG_PATH
}

module.exports = config;