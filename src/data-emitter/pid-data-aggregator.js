const pidControllerRegistry = require('../pid/pid-controller-registry');

class PidControllerDataAggregator {
  constructor() {
    this.pidControllers = pidControllerRegistry.getPidControllers();

    this.aggregatedCtrlData = [];
    for (let pidController of this.pidControllers) {
      this._aggregateEventData(pidController, this.aggregatedCtrlData);
    }
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

  getData(){
    return this.aggregatedCtrlData;
  }
}

module.exports = new PidControllerDataAggregator();
