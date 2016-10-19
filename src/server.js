'use strict'

var bodyParser = require('body-parser');

var app = require('express')();

var logger = require('./core/logger');
var io = require('./core/socket-io');
var Herms = require('./herms');
var herms = new Herms();

// setup CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

// TODO: move routes to seperate class!

app.get('/api/pins', (req, res) => {
  let pins = herms.getPins();

  return res.send(pins);
});

app

app.post('/api/pins/:name', (req, res) => {
  let pinName = req.params.name;
  let value = req.body.pinValue;

  herms.writePin(pinName, value, (err) => {
    if (err) {
      res.status(400).send({
        'error': err.message
      });
    } else {
      res.send({
        'pin': pinName,
        'value': value
      });
    }
  });
  //}
});

app.post('/api/pid-controller', (req, res) => {
  let body = req.body;

  if (body) {
    let config = body;
    herms.setPidController(config);

    res.status(200).send(herms.getPidController());

  } else {
    res.status(400).send();
  }
});

app.get('/api/pid-controller', (req, res) => {
  let status = herms.getPidController();

  res.send(status);
});

function isParamValueValid(value) {
  return (value === true ||
    value === false ||
    value === 'true' ||
    value === 'false');
}

// END TODO: move routes to seperate class!

io.on('disconnect', function () {
  console.log('Client disconnect');
});

io.on('connect', function () {
  console.log('Client connected');
});


app.listen(8081, function () {
  logger.logInfo("server", 'app.listen', 'Server started on 8081');
  let pinsData = {},
    pidControllerData = {};

  herms.start();

  herms.on('pidController', (data) => {
    pidControllerData = data;
  });

  herms.on('pinData', (data) => {
    pinsData = data;
  });

  //  setup emiting data
  setInterval(function () {
    io.emit('pins', pinsData);
    io.emit('pidController', pidControllerData);

  }, 1000)
});