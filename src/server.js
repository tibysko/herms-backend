'use strict'

var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var path = require('path');

var logger = require('./core/logger');
var io = require('./core/socket-io');
const config = require('./config/config');
var Herms = require('./herms');


var app = express();
var herms = new Herms();
const env = process.env;

// setup CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

// serve frontend
if (env.FRONTEND_PATH && fs.existsSync(env.FRONTEND_PATH)) {
  logger.logInfo('server', 'server', 'Serving frontend from: ' + env.FRONTEND_PATH);

  app.use(express.static(env.FRONTEND_PATH));
}

// TODO: move routes to seperate class!

app.get('/api/pins', (req, res) => {
  let pins = herms.getPins();

  return res.send(pins);
});

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

// END TODO: move routes to seperate class!

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Start backend
app.listen(config.port, function () {
  logger.logInfo("server", 'app.listen', 'Server started on 8081');
  let pinsData = {},
    pidControllerData = {},
    valvesData = {};

  herms.start();

  herms.on('pidController', (data) => {
    pidControllerData = data;
  });

  herms.on('pins', (data) => {
    pinsData = data;
  });

  herms.on('valves', (data) => {
    valvesData = data;
  });

  //  setup emiting data
  setInterval(function () {
    io.emit('pins', pinsData);
    io.emit('pidController', pidControllerData);
    io.emit('valves', valvesData);
    io.emit('nisse', 'ddd');


  }, 1000)
});