
const config = {
    port: process.env.BACKEND_PORT | 8081,
    websocketPort: process.env.BACKEND_WEBSOCKET_PORT | 8082,
    usbPort: process.env.USB_PORT
}

module.exports = config;