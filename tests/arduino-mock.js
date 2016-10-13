"use strict"

var five = require('johnny-five');
var logger = require('./../core/logger');
var Firmata = require('mock-firmata').Firmata;

class ArduinoMock {

    setup(cb) {
        var io = new Firmata();

        io.SERIAL_PORT_IDs.DEFAULT = 0x08;

        var board = new five.Board({
            io: io,
            debug: false,
            repl: false
        });

        this.board.on('ready', function boardReady() {
            logger.logInfo('Arduino.constructor', 'Board Initialized');

            cb(null);
            return;
        });
        
        io.emit("connect");
        io.emit("ready");
    }
}

module.exports = ArduinoMock;