const EventEmitter = require('events');
const fs = require('fs');

class ValveService extends EventEmitter {

    constructor(board) {
        super();

        this.valves = JSON.parse(fs.readFileSync("./src/config/valves.json"));
        this.board = board;

        this.board.on('data', (pins) => {

            for (let valve of this.valves) {
                let values = {
                    opened: pins[valve.pin.opened].value,
                    closed: pins[valve.pin.closed].value,
                }
                
                if (pins[valve.pin.actPos]){
                    values.actPos = pins[valve.pin.actPos].value;
                }
                valve.in = values;

                let status = {};

                if (values.opened > 0) {
                    status = 'OPENED';
                } else if (values.closed > 0) {
                    status = 'CLOSED';
                } else {
                    status = 'ADJUSTING';
                }

                valve.status = status;
            }

            this.emit('data', this.valves);
        });
    }
}

module.exports = ValveService;