"use strict";

var winston = require('winston');

class Logger {
    
    static logInfo(moduleName, functionName, message) {
        winston.log('info', '[' + moduleName + '.' + functionName + '] ' + message);
    }

    static logError(moduleName, functionName, message) {
        winston.log('error', '[' + moduleName + '.' + functionName + '] ' + message);
    }

    static logWarning(moduleName, functionName, message) {
        winston.log('warn', '[' + moduleName + '.' + functionName + '] ' + message);
    }

}

module.exports = Logger;