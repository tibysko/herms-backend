const parameterController = require('../parameters/parameter-controller');
const PidController = require('./pid-controller');

const LONG_NAME = 'PidController MLT';
const MAX_OUTPUT_LIMIT = 0; 
const MIN_OUTPUT_LIMIT = 100; 
const NAME = 'pidCtrlMLT';
const T2_OFFSET = 't2_offset';
const T2_SCALING = 't2_scaling';
const TEMPERATURE_PIN = 'T2_HE_WORT_OUT';


class MltPidController extends PidController{
  constructor() {
    super(NAME, LONG_NAME, T2_OFFSET, T2_SCALING, TEMPERATURE_PIN);
    this.setOutputLimits(MIN_OUTPUT_LIMIT, MAX_OUTPUT_LIMIT); 
  }
}

module.exports = new MltPidController();