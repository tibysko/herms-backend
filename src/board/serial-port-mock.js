const logger = require('../core/logger');
const EventEmitter = require('events');

class SerialPortMock extends EventEmitter {

  constructor(usbPort, params) {
    super(); // EventEmitter constructor
    this.moduleName = 'SerialPortMock';

    setInterval(() => this._emulateReadBoard, 1000);
  }

  write(data, cb) {
    //logger.logInfo(this.moduleName, 'Write', data.replace('\n', ''));
    process.nextTick(cb);
  }

  open(cb) {
    process.nextTick(cb);
  }

  drain(cb) {
    process.nextTick(cb);
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
