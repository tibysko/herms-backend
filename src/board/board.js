const EventEmitter = require('events');
const fs = require('fs');
const SerialPort = require('serialport');

class Board extends EventEmitter {

    constructor() {
        super(); // EventEmitter constructor
        this.pins = {};
        this.serialPort = {};
    }

    setup() {
        this.pins = JSON.parse(fs.readFileSync("src/config/pins.json"));

        // Initialize this.pins with value 0
        for (var key in this.pins) {
            if (this.pins.hasOwnProperty(key)) {
                this.pins[key].value = 0;
            }
        }

        this.serialPort = new SerialPort('com3', {
            parser: SerialPort.parsers.readline('\n')
        });

        this.serialPort.on('data', (data) => {
            let dataArray = data.split("|");
            let pinId = dataArray[0];
            let value = dataArray[1];

            let pin = this.pins[pinId];

            if (pin && value) {
                pin.value = value.replace('\r', '');
            }
        });

        setInterval(() => {
            this.emit('data', this.pins);
        }, 500);
    }

    writePin(pinId, value, cb) {
        let pin = this.pins[pinId];

        let pinIdTemp = "000" + pinId;
        pinIdTemp = pinIdTemp.substring(pinIdTemp.length - 3, pinIdTemp.length);

        let pinValueTemp = "0000" + value;
        pinValueTemp = pinValueTemp.substring(pinValueTemp.length - 4, pinValueTemp.length);

        let cmd = pin.mode + pinIdTemp + pinValueTemp + '\n';
        console.log('Cmd: ' + cmd)

        this.serialPort.write(cmd, cb);
    }
}

module.exports = Board;