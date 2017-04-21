const parameterController = require('../parameters/parameter-controller');
const PidController = require('./pid-controller');

const LONG_NAME = 'PidController MLT';
const NAME = 'pidCtrlMLT';
const T2_OFFSET = 't2_offset';
const T2_SCALING = 't2_scaling';
const TEMPERATURE_PIN = 'T2_MLT_WORT_OUT';


class MltPidController extends PidController{
  constructor() {
    super(NAME, LONG_NAME, T2_OFFSET, T2_SCALING, TEMPERATURE_PIN);
  }
}

module.exports = new MltPidController();