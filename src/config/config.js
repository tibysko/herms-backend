
const config = {
    port: process.env.PORT | 8080,
    websocketPort: process.env.SOCKET_PORT | 8081,
    usbPort: process.env.USB_PORT | 'com3'
}

module.exports = config;