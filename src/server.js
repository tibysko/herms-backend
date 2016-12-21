'use strict'

var bodyParser = require('body-parser');
var cors = require('cors')
var compression = require('compression');
var express = require('express');
var fs = require('fs');
var path = require('path');

const config = require('./config/config');
const logger = require('./core/logger');
const io = require('./core/socket-io');
const routes = require('./routes');
const herms = require('./herms');

var app = express();
const env = process.env;

// serve frontend
if (env.FRONTEND_PATH && fs.existsSync(env.FRONTEND_PATH)) {
  logger.logInfo('server', 'server', 'Serving frontend from: ' + env.FRONTEND_PATH);

  app.use(express.static(env.FRONTEND_PATH));
}

app.use(bodyParser.json());
app.use(cors());
// compress all requests 
app.use(compression());

// register api routes
app.use('/api', routes);

// Start backend
app.listen(config.port, function () {
  logger.logInfo("server", 'app.listen', 'Server started on ' + config.port);

  herms.start();

  // Setup websocket
  herms.on('controllers', (data) => {
    io.emit('controllers', data);
  });

  herms.on('valves', (data) => {
    io.emit('valves', data);
  });

  herms.on('pins', (data) => {
    io.emit('pins', data);
  });


});