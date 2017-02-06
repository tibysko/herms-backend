'use strict'

const bodyParser = require('body-parser');
const cors = require('cors')
const compression = require('compression');
const express = require('express');
const expressValidator = require('express-validator');
const fs = require('fs');

const config = require('./config/config');
const logger = require('./core/logger');
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
app.use(expressValidator({
 customValidators: {
    isArray: function(value) {
        return Array.isArray(value);
    }
 }
}));
app.use(cors());
app.use(compression()); // compress all requests 
app.use('/api', routes); // register api routes

// Start backend
app.listen(config.port, function () {
  logger.logInfo('server', 'app.listen', 'Server started on ' + config.port);

  herms.start();
});