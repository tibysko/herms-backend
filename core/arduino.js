"use strict"

var five = require('johnny-five');
var logger = require('./logger');
var Firmata = require('mock-firmata').Firmata;

class Arduino {

    setup(cb) {
        var io = new Firmata();

        io.SERIAL_PORT_IDs.DEFAULT = 0x08;

        var board = new five.Board({
            io: io,
            debug: false,
            repl: false
        });

        //var Board = five.Board;
        //this.board = new Board({
        //    repl: false
        //});

        board.on('ready', function boardReady() {
            logger.logInfo('Arduino.constructor', 'Board Initialized');

            cb(null);
            return;
        });
        
        io.emit("connect");
        io.emit("ready");

    }
}

module.exports = Arduino;