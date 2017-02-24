const async = require('async');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
let SerialPort = require('serialport');

const config = require('../config/config');
const logger = require('../core/logger');

console.log("Mock: " + process.env.MOCK);

if (process.env.MOCK) {
  logger.logWarning('Board-controller', 'Mock', 'Starting with mocked SerialPort')
  SerialPort = require('./serial-port-mock');
}

const PIN_HIGH = 1;
const PIN_LOW = 0;

const UPDATE_INTERVAL = 100;
const WORKERS = 1;

class BoardController extends EventEmitter {

  constructor() {
    super(); // EventEmitter constructor

    this.serialPort = {};
    this.moduleName = 'BoardController';
    this.writePinQueue = async.queue((task, cb) => this._writePinTask(task, cb), WORKERS);

    this.serialPort = new SerialPort(config.usbPort, {
      parser: SerialPort.parsers.readline('\n'),
      baudRate: 115200,
      autoOpen: false
    });

    this.pins = JSON.parse(fs.readFileSync(path.join(__dirname, './pins.json')));

    // Initialize pins with value 0
    for (let currPin in this.pins) {
      this.pins[currPin].value = 0;
    }
  }

  getPins() {
    let pinObject = {};

    for (let key in this.pins) {
      if (this.pins.hasOwnProperty(key)) {
        // translates pin id to pin name
        let pin = this.pins[key];
        pinObject[pin.name] = pin;
      }
    }

    return pinObject;
  }

  init(cb) {
    this.serialPort.open(err => {
      if (err) {
        logger.logError(this.moduleName, 'Setup', 'Could not open port');
        logger.logError(this.moduleName, 'Setup', err);

        return cb(err);
      }

      return cb();
    });
  }

  start() {
    this._setupSerialPortListener();
    this._setupEventEmitter();
  }

  writePin(pinName, value, cb) {
    this.writePinQueue.push({
      pinName: pinName,
      value: value
    }, (err) => {
      if (err) return cb(err);

      return cb();
    });
  }

  _findPin(pinName) {
    let foundPin;

    for (let key in this.pins) {
      let pin = this.pins[key];

      if (pin.name === pinName) { // pin found
        foundPin = pin;
        break;
      }
    }

    return foundPin;
  }

  _setupEventEmitter() {
    setInterval(() => {
      this.emit('data', this.getPins());
    }, UPDATE_INTERVAL);
  }

  _setupSerialPortListener() {
    this.serialPort.on('data', (data) => {
      let dataArray = data.split("|");
      let pinId = dataArray[0];
      let value = dataArray[1];

      let pin = this.pins[pinId];

      if (pin && value) {
        pin.value = value.replace('\r', '');
      }
    });
  }

  _writePinTask(task, cb) {
    let pinName = task.pinName;
    let value = task.value;
    let foundPin = this._findPin(pinName);

    if (foundPin) {
      let pinIdTemp = "000" + foundPin.id;
      pinIdTemp = pinIdTemp.substring(pinIdTemp.length - 3, pinIdTemp.length);

      let pinValueTemp = "0000" + value;
      pinValueTemp = pinValueTemp.substring(pinValueTemp.length - 4, pinValueTemp.length);

      let cmd = foundPin.mode + pinIdTemp + pinValueTemp + '\n';

      this.serialPort.write(cmd, () => {
        this.serialPort.drain(cb); // Waits until all output data has been transmitted to the serial port
      });

    } else {
      logger.logError(this.moduleName, 'WritePin', 'Pin with name [' + pinName + '] was not found');
    }
  }
}

module.exports.BoardController = new BoardController();
module.exports.BoardConstants = {
  PIN_HIGH: PIN_HIGH,
  PIN_LOW: PIN_LOW
}
