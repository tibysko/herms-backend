
const config = require('./config/config');

var io = require('socket.io').listen(config.websocketPort);

class SocketIO {
    constructor(){
        this.io = io;
    }

    emit(channel, message) {
        this.io.sockets.emit(channel, message);
    }

    on(event, cb) {
        this.io.sockets.on(event, cb);
    }
}

module.exports = new SocketIO();