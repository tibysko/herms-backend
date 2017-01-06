const logger = require('../core/logger');
const EventEmitter = require('events');

class SerialPortMock extends EventEmitter {

  constructor(usbPort, params, cb) {
    super(); // EventEmitter constructor
    this.moduleName = 'SerialPortMock';

    setInterval(() => this._emulateReadBoard, 500);

    setTimeout(cb, 500); // emulate successful serialport 
  }

  write(data) {
    logger.logInfo(this.moduleName, 'Write', data);
  }

  _emulateReadBoard() {
    this.emit('data', ''); // todo emit data?
  }

  static get parsers() {
    return {
      readline: function (data) {}
    }
  }
}

module.exports = SerialPortMock;
