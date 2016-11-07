'use strict'

var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var path = require('path');

var logger = require('./core/logger');
var io = require('./core/socket-io');
const config = require('./config/config');
const routes = require('./routes');

var app = express();
const env = process.env;

// setup CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use('/api', routes);

// serve frontend
if (env.FRONTEND_PATH && fs.existsSync(env.FRONTEND_PATH)) {
  logger.logInfo('server', 'server', 'Serving frontend from: ' + env.FRONTEND_PATH);

  app.use(express.static(env.FRONTEND_PATH));
}

// Start backend
app.listen(config.port, function () {
  logger.logInfo("server", 'app.listen', 'Server started on ' + config.port);
});