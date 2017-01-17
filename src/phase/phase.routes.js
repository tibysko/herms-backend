const router = require('express').Router();

const phaseController = require('./phase-controller');

router.route('/').get((req, res) => {
  res.send(phaseController.getPhases());
});

router.route('/:id/activate').put((req, res) => {
  let id = req.params.id;

  let phase = phaseController.activatePhase(id);

  if (phase instanceof Error) {
    res.status(400).send(phase.message);
  } else {
    return res.send(phase);
  }
});

router.route('/:id').put((req, res) => {
  let phase = req.body;
  let phaseId = req.params.id;

  if (!phase) {
    res.status(400).send('Missing phase on body');
  } else {
    let updatedPhase = phaseController.updatePhase(phaseId, phase);

    if (updatedPhase instanceof Error) {
      res.status(500).send(updatedPhase.message);
    } else {
      res.send(updatedPhase);
    }
  }
});

router.route('/:id').delete((req, res) => {
  let phaseId = req.params.id;

  if (!phaseId) {
    res.status(400).send({
      error: 'missing phaseId'
    });
  } else {
    let deletedId = phaseController.deletePhase(phaseId);

    if (deletedId instanceof Error) {
      res.status(500).send({
        error: deletedId.message
      });
    } else {
      res.send(deletedId);
    }
  }
});

router.route('/').post((req, res) => {
  let phase = req.body;

  if (!phase) {
    res.status(400).send({
      'error': 'missing body'
    });

  } else {
    let newPhase = phaseController.createPhase(phase);

    if (newPhase instanceof Error) {
      res.status(400).send(newPhase.message);
    } else {
      return res.send(newPhase);
    }
  }
});

module.exports = router;
