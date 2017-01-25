﻿"use strict";
var winston = require('winston');
const socketServer = require('../data-emitter/socket-server');

winston.add(require('winston-daily-rotate-file'), {
  level: 'error',
  filename: './logs/filelog-error.log'
});

class Logger {

  logInfo(moduleName, functionName, message) {
    this.log('info', message, moduleName, functionName);
  }

  logError(moduleName, functionName, message) {
    this.log('error', message, moduleName, functionName);
    socketServer.emit('error', message);
  }

  logWarning(moduleName, functionName, message) {
    this.log('warn', message, moduleName, functionName);
  }

  log(level, message, moduleName, functionName) {
    let metadata = {
      module: moduleName,
      function: functionName
    }

    winston.log(level, message, metadata);
  }

  loggErrorAndExecuteCb(moduleName, functionName, message, cb) {
    Logger.logError(moduleName, functionName, message, cb);
    let err = new Error("message");
    cb(new Error(message));
  }

  readLogs(cb) {
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

module.exports = new Logger();
