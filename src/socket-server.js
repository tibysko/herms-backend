const io = require('socket.io');

const config = require('./config/config');

class SocketIO {
    constructor(){
        this.io = io;
        
        io.listen(config.websocketPort);
    }

    emit(channel, message) {
        io.sockets.emit(channel, message);
    }

    on(event, cb) {
        io.sockets.on(event, cb);
    }
}

module.exports = new SocketIO();