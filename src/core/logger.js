"use strict";

const socketio = require('./socket-io');
var winston = require('winston');


winston.add(require('winston-daily-rotate-file'), {
    level: 'error',
    filename: './logs/filelog-error.log'
})

class Logger {

    static logInfo(moduleName, functionName, message) {
        Logger.log('info', message, moduleName, functionName);
    }

    static logError(moduleName, functionName, message) {
        Logger.log('error', message, moduleName, functionName);
    }

    static logWarning(moduleName, functionName, message) {
        Logger.log('warn', message, moduleName, functionName);
    }

    static log(level, message, moduleName, functionName) {
        let metadata = {
            module: moduleName,
            function: functionName
        }

        winston.log(level, message, metadata);
        socketio.emit(level, message);
    }

    static readLogs(cb) {
        var options = {
            from: new Date - 24 * 60 * 60 * 1000,
            until: new Date,
            limit: 10,
            start: 0,
            order: 'desc',
            fields: ['message', 'timestamp', 'level', 'function', 'module']
        };

        //
        // Find items logged between today and yesterday.
        //

        winston.query(options, function (err, results) {
            if (err) {
                throw err;
            }

            cb(results);
        });
    }

}

module.exports = Logger;