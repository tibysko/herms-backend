var asyncSeries = require('async/series');

class Scheduler {

    constructor() {
        this.tasks = [];
    }

    addTask(callackMethod) {
        this.tasks.push(callackMethod); // async expects a function
    }

    run(done) {
        asyncSeries(this.tasks, done);
    }

    getTasks() {
        return this.tasks;
    }

    start() {

    }

    stop() {

    }
}

module.exports = Scheduler;