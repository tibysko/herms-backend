var io = require('socket.io').listen(8080);

class SocketIO {
    static emit(channel, message){
        io.sockets.emit(channel, message);
    }

    static on(event, cb){
        io.sockets.on(event, cb);
    }
}

module.exports = SocketIO;


