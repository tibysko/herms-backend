const router = require('express').Router();

const boardRoutes = require('./board/board.routes');
const loggerRoutes = require('./core/logger.routes');
const parameterRoutes = require('./parameters/parameter.routes');
const phaseRoutes = require('./phase/phase.routes');
const pidRoutes = require('./pid/pid.routes');
const valveRoutes = require('./valve/valve.routes');

router.use('/logs', loggerRoutes);
router.use('/pins', boardRoutes);
router.use('/parameters', parameterRoutes);
router.use('/phases', phaseRoutes);
router.use('/pid-controllers', pidRoutes);
router.use('/valves', valveRoutes);


module.exports = router; 