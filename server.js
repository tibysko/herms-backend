'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var httpServer = require("http").createServer(app);
var logger = require('./core/logger');

var HermsGpio = require('./core/herms-gpio');
var hermsGpio = new HermsGpio();
hermsGpio.setup();

// API routes
app.use(bodyParser.json());

app.get('/api/pins', (req, res) => {
  let pins = hermsGpio.getPins();
  let pinToReturn = [];

  // convert from map to array
  for (let key in pins) {
    if (pins.hasOwnProperty(key)) {
      let newPin = {
        "name": key,
        "board": pins[key].board,
        "type": pins[key].type,
        "mode": pins[key].mode,
        "id": pins[key].id,
        "initValue": pins[key].initValue
      }

      pinToReturn.push(newPin);
    }
  }

  return res.send(pinToReturn);
});

app.get('/api/pins/:name', (req, res) => {
  if (!req.params.name) {
    res.status(400).send('Missing parameter: name');
  } else {

    let pinName = req.params.name;

    hermsGpio.readPin(pinName, (error, value) => {
      if (error) {
        console.log(error);
        res.status(500).send({ 'error': error.message });
      } else {
        res.send({ 'pin': pinName, 'value': value });
      }
    });
  }
});

app.post('/api/pins/:name', (req, res) => {
  if (!req.params.name) {
    res.status(400).send('Missing parameter: name');
  } else if (req.body.value === undefined) {
    res.status(400).send({ "error": "Missing pin value" });
  } else {

    let pinName = req.params.name;
    let value = req.body.value;

    hermsGpio.writePin(pinName, value, (err) => {
      if (err) {
        res.status(400).send({ 'error': err.message });
      } else {
        res.send({ 'pin': pinName, 'value': value });
      }
    });
  }
});


app.listen(8081, function () {
  logger.logInfo("server", "Server started on 8081");
});


