'use strict'


var bodyParser = require('body-parser');

var app = require('express')();
var http = require('http').Server(app);

var logger = require('./core/logger');
var io = require('./core/socket-io');

var Herms = require('./core/herms');
var herms = new Herms();


// API routes
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/pins', (req, res) => {
  let pins = hermsGpio.getPins();

  return res.send(pins);
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
        res.send({ 'name': pinName, 'value': value });
      }
    });
  }
});

app.post('/api/pins/:name', (req, res) => {
  let name = req.params.name;
  let value = req.params.value;

  if (!name) {
    res.status(400).send('Missing parameter: name');
  } else if (value === 'undefined') {
    res.status(400).send({ "error": "Missing pin value" });
  } else if (!isParamValueValid(value)) {
    res.status(400).send({ "error": "value must be true or false" })
  } else {

    let pinName = req.params.name;
    let value = req.body.value;
    value = (value === 'false' || value === false ? 0 : 1);

    hermsGpio.writePin(pinName, value, (err) => {
      if (err) {
        res.status(400).send({ 'error': err.message });
      } else {
        res.send({ 'pin': pinName, 'value': value });
      }
    });
  }
});

function isParamValueValid(value) {
  return !(value === true ||
    value === false ||
    value === 'true' ||
    value === 'false');
}
app.listen(8081, function () {
  logger.logInfo("server", "Server started on 8081");

  herms.start();

});
