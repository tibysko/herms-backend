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
/*
  logger.logInfo('server.js', 'app.post(/api/pins/:name)', 'Name: ' + pinName + ' body:' + JSON.stringify(req.body));

  if (!pinName) {
    res.status(400).send('Missing parameter: name');
  } else if (value === 'undefined') {
    res.status(400).send({
      "error": "Missing pin value"
    });
  } else if (!isParamValueValid(value)) {
    res.status(400).send({
      "error": "value must be true or false"
    })
  } else {
    value = (value === 'false' || value === false ? 0 : 1);
*/

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

  if(body){
    if (body.setPoint){
      herms.setSetPoint(body.setPoint);
    } else if (body.output){
      herms.setOutput(body.output);
    } else if(body.mode){
      herms.setMode(body.mode);
    }
  }

  res.status(200).send();
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
    //sconsole.log(pidControllerData);

  }, 1000)
});