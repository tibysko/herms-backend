
const config = {
    port: process.env.port | 8080,
    websocketPort: process.env.SOCKET_PORT | 8081,
    usbPort: 'com3'
}

module.exports = config;