const PidController = require('./pid-controller');
const parameterController = require('../parameters/parameter-controller');

const HEATER_PIN = 'HLT_HEATER';
const NAME = 'pidCtrlHLT';
const LONG_NAME = 'PidController HLT';
const T1_OFFSET = 't1_offset';
const T1_SCALING = 't1_scaling';
const TEMPERATURE_PIN = 'T1_HLT';

class HltPidController extends PidController {
  constructor() {
    super(NAME, LONG_NAME, T1_OFFSET, T1_SCALING, TEMPERATURE_PIN);

    this.on('data', (data) => {
      this.boardController.writePin(HEATER_PIN, data.output, function () {}); 
    });
  }
}

module.exports = new HltPidController();
