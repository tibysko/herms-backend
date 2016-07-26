var express = require('express');
var app = express();
var httpServer = require("http").createServer(app);
var logger = require('./core/logger');

var HermsGpio = require('./core/herms-gpio');
var hermsGpio = new HermsGpio();

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  logger.logInfo("Server started on: " + host + ":" + port);

  setTimeout(function () {
    hermsGpio.writeToPin('LED_RED', 1, function (err) {
      if(err) {
        console.log('error writing to led');
      }else{
        console.log('wrote to led');
      }

      
     })
  }, 5000);

  setTimeout(() => {
    console.log('reading value');
    hermsGpio.readPin('BUTTON_1', (err, value) => {
      console.log('value: ' + value);

    });
  }, 5000);

  

});


