const EventEmitter = require('events');
const fs = require('fs');
const logger = require('../core/logger');
const path = require('path');

class BoardMock extends EventEmitter {

    constructor() {
        super(); // EventEmitter constructor
        this.pins = {};
        this.serialPort = {};
        this.moduleName = 'BoardMock';
    }

    setup(cb) {        
        this.pins = JSON.parse(fs.readFileSync(path.join(__dirname, '../board/pins.json')));

        // Initialize this.pins with value 0
        for (var key in this.pins) {
            if (this.pins.hasOwnProperty(key)) {
                this.pins[key].value = 0;
            }
        }

        setInterval(() => {
            this.emit('data', this.getPinData());
        }, 100);

        cb(null);

    }

    writePin(pinName, value, cb) {
        //logger.logWarning(this.moduleName, 'WitePin', 'Wrote ' + value + ' to pin ' + pinName);
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

        pinObject['MLT_KET_BYPASS_OPENED'].value = 1;
        pinObject['MLT_WORT_IN_CLOSED'].value = 1;     
        pinObject['T1_HLT'].value = Math.floor(Math.random() * 100) + 100;     
        pinObject['T2_HE_WORT_OUT'].value = Math.floor(Math.random() * 100) + 100;     
           

        return pinObject;
    }
}

module.exports = BoardMock;
