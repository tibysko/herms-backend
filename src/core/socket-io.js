const config = require('../config/config');

console.log('websocket' + config.websocketPort);

var io = require('socket.io').listen(config.websocketPort);

class SocketIO {
    static emit(channel, message){
        io.sockets.emit(channel, message);
    }

    static on(event, cb){
        io.sockets.on(event, cb);
    }
}

module.exports = SocketIO;


