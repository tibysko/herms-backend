/**
 * Main for the Herms System.  
 * 
 */

const EventEmitter = require('events');

const boardController = require('./board/board-controller').BoardController;
const pidControllerRegistry = require('./pid/pid-controller-registry');
const logger = require('./core/logger');
const socketDataEmiter = require('./data-emitter/socket-data-emiter');

class Herms extends EventEmitter {
  constructor() {
    super(); // eventemitter constructor
    this.moduleName = 'Herms';
    this.boardController = boardController;
    this.pidControllerRegistry = pidControllerRegistry;
    this.socketDataEmiter = socketDataEmiter;
  }

  start() {
    this.boardController.init(err => {
      if (err) return logger.logError(this.moduleName, 'start', 'Failed to setup board-controller');

      this.boardController.start();
      this.pidControllerRegistry.startPidControllers();
      this.socketDataEmiter.start();
    });
  }
}

module.exports = new Herms();
