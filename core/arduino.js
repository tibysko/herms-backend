"use strict"

var five = require('johnny-five');
var logger = require('./logger');

class Arduino {     

    setup(cb) {    
        var Board = five.Board;
        this.board = new Board({
            repl: false
        });
        
        this.board.on('ready', function boardReady(){
            logger.logInfo('Arduino.constructor', 'Board Initialized');
            
            cb(null);
            return;
        });
    }
}

module.exports = Arduino;