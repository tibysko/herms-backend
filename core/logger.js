"use strict";

var winston = require('winston');

class Logger {
    
    static logInfo(moduleName, message) {
        winston.log('info', '[' + moduleName + '] ' + message);
    }

    static logError(moduleName, message) {
        winston.log('error', '[' + moduleName + '] ' + message);
    }

    static logWarning(moduleName, message) {
        winston.log('warn', '[' + moduleName + '] ' + message);
    }

}

module.exports = Logger;