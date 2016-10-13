"use strict";

const winston = require('winston');
const socketio = require('./socket-io');

class Logger {
    
    static logInfo(moduleName, functionName, message) {
        let concatedMessage = Logger.createMessage(moduleName, functionName, message); 

        winston.log('info', concatedMessage);
        socketio.emit('info', concatedMessage);
    }

    static logError(moduleName, functionName, message) {
        let concatedMessage = Logger.createMessage(moduleName, functionName, message);

        winston.log('error', concatedMessage);
        socketio.emit('error', concatedMessage);
    }

    static logWarning(moduleName, functionName, message) {
        let concatedMessage = Logger.createMessage(moduleName, functionName, message);

        winston.log('warn', concatedMessage);
        socketio.emit('warn', concatedMessage);
    }

    static createMessage(moduleName, functionName, message) {
        return '[' + moduleName + '.' + functionName + '] ' + message;
    }

}

module.exports = Logger;