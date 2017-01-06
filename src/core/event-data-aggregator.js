const boardController = require('../board/board-controller').BoardController;
const pidControllerRegistry = require('../pid/pid-controller-registry');
const valveController = require('../valve/valve-controller').ValveController;
const socketServer = require('../socket-server');

class EventDataAggregator {
  constructor() {
    this.pidControllers = pidControllerRegistry.getPidControllers();

    this.aggregatedCtrlData = [];
    for (let pidController of this.pidControllers) {
      this._aggregateEventData(pidController, this.aggregatedCtrlData);
    }

    // take first controller and emit all controller data
    if (this.pidControllers.length > 0) {
      this.pidControllers[0].on('data', (ignore) => {
        this.emit('controllers', this.aggregatedCtrlData);
      });
    }
  }

  _addEmitter(eventName, eventObject) {
    eventObject.on('data', (data) => {
      this.emit(eventName, data);
    });
  }

  _aggregateEventData(eventObject, dataArray) {
    eventObject.on('data', (data) => {
      let itemIndex = -1;

      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].name == data.name) {
          itemIndex = i;
          break;
        }
      }

      if (itemIndex >= 0) {
        dataArray[itemIndex] = data;
      } else {
        dataArray.push(data);
      }
    });
  }
}

module.exports = new EventDataAggregator();
