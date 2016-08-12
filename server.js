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
  res.send(hermsGpio.getPins());
});

app.get('/api/pin/:name', (req, res) => {
  if (!req.params.name) {
    res.status(400).send('Missing parameter: name');
  } else if (req.body.value === undefined) {
    res.status(400).send({ "error": "Missing pin value" });
  } else {

    let pinName = req.params.name;

    hermsGpio.readPin(pinName, (error, value) => {
      if (error)
        res.status(500).send({ 'error': error });
      else
        res.send({ 'pin': pinName, 'value': value });
    });
  }
});

app.post('/api/pin/:name', (req, res) => {
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


