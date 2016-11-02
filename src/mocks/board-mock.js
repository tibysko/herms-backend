const EventEmitter = require('events');
const fs = require('fs');
const logger = require('../core/logger');

class BoardMock extends EventEmitter {

    constructor() {
        super(); // EventEmitter constructor
        this.pins = {};
        this.serialPort = {};
        this.moduleName = 'BoardMock';
    }

    setup(cb) {
        this.pins = JSON.parse(fs.readFileSync("./src/config/pins.json"));

        // Initialize this.pins with value 0
        for (var key in this.pins) {
            if (this.pins.hasOwnProperty(key)) {
                this.pins[key].value = 0;
            }
        }

        setInterval(() => {
            this.emit('data', this.getPinData());
        }, 500);

        cb(null);

    }

    writePin(pinName, value, cb) {
        logger.logWarning(this.moduleName, 'WitePin', 'Wrote ' + value + ' to pin ' + pinName);
        cb(null);
    }

    getPinData() {
        let pinObject = {};

        for (var key in this.pins) {
            if (this.pins.hasOwnProperty(key)) {

                let pin = this.pins[key];
                pinObject[pin.name] = pin;
            }
        }

        return pinObject;
    }
}

module.exports = BoardMock;
