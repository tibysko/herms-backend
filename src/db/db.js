const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, './herms-db.sqlite3'));
const logger = require('../core/logger');
const moduleName = 'db';

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pidcontroller (
            ID          INTEGER PRIMARY KEY AUTOINCREMENT,
            NAME        VARCHAR(40),
            TEMPERATURE INT NOT NULL,
            TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NOT NULL
        )`);
});

module.exports = db;
