const PidController = require('./pid-controller');
const parameterController = require('../parameters/parameter-controller');

const T1_OFFSET = 't1_offset';
const T1_SCALING = 't1_scaling';
const HEATER_PIN = 'HLT_HEATER';
const TEMPERATURE_PIN = 'T1_HLT';

class HltPidController extends PidController {
  constructor() {
    super(T1_OFFSET, T1_SCALING, TEMPERATURE_PIN);

    this.on('data', (data) => {
      this.boardController.writePin(HEATER_PIN, data.output, function () {}); 
    });
  }
}

module.exports = new HltPidController();
