const db = require('../db/db');
const pidHLT = require('../pid/hlt-pid-controller');
const pidMLT = require('../pid/mlt-pid-controller');

const INTERVALL = 2000; // 2 s
let pidHLTData = undefined;
let pidMLTData = undefined;

function gatherStatistics() {
  db.serialize(() => {
    db.run(`INSERT INTO PIDCONTROLLER (NAME, TEMPERATURE) 
            VALUES ('${pidHLTData.name}',${pidHLTData.temperature});`);
    db.run(`INSERT INTO PIDCONTROLLER (NAME, TEMPERATURE) 
            VALUES ('${pidMLTData.name}',${pidMLTData.temperature});`);
  });
}

function start() {
  pidHLT.on('data', data => pidHLTData = data);
  pidMLT.on('data', data => pidMLTData = data);

  setInterval(() => gatherStatistics(), INTERVALL);
}

module.exports = {
  start
}
