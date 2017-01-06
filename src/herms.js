/**
 * Main for the Herms System.  
 * 
 */

const EventEmitter = require('events');

const boardController = require('./board/board-controller').BoardController;
const pidControllerRegistry = require('./pid/pid-controller-registry');
const io = require('./socket-server');
const logger = require('./core/logger');

class Herms extends EventEmitter {
  constructor() {
    super(); // eventemitter constructor
    this.moduleName = 'Herms';
    this.boardController = boardController;
    this.pidControllerRegistry = pidControllerRegistry;
  }

  start() {
    this.boardController.setup((err) => {
      if (err) {
        return logger.logError(this.moduleName, 'start', 'Failed to setup board-controller');
      }

      for (let controller of this.pidControllerRegistry.getPidControllers()) {
        controller.start();
      }
    });
  }
}

module.exports = new Herms();
