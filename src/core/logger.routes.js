const logger = require('./logger');

const router = require('express').Router();

router.route('/error').get((req, res) => {
  logger.readLogs((results) => {
    res.send(results);
  })
});

module.exports = router;