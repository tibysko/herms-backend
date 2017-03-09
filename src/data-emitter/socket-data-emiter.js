/**
 * This class is responsible for sending all "live" data to the frontend with one exception (errors)!
 * All errors logged in core/logger is also emitted to the fronted. 
 * 
 */

const boardController = require('../board/board-controller').BoardController;
const logger = require('../core/logger');
const pidDataAggregator = require('./pid-data-aggregator');
const socketServer = require('./socket-server');
const valveController = require('../valve/valve-controller').ValveController;
const valveControllerHeHwIn = require('../valve/valve-controller-he-hw-in');
const levelControllerHlt = require('../valve/level-controller-hlt');

const UPDATE_INTERVAL = 500; // ms

class SocketDataEmitter {
  constructor() { }

  start() {
    logger.logInfo('SocketDataEmitter', 'start', 'Starting to emit data over websocket');

    setInterval(() => {
      socketServer.emit('controllers', pidDataAggregator.getData());
      socketServer.emit('valves', valveController.getValves());
      socketServer.emit('pins', boardController.getPins());

      let systemStatus = {
        HLT: {
          waterLevel: levelControllerHlt.getWaterLevel(),
        },
        HE: {
          HeHwInActPos: valveControllerHeHwIn.getValvePos()
        }
      }

      socketServer.emit('system', systemStatus);
    }, UPDATE_INTERVAL);
  }
}

module.exports = new SocketDataEmitter();
