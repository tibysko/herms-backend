var Scheduler = require('./scheduler');
var chai = require('chai');
const assert = require('chai').assert;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

describe('Scheduler', function () {
  var scheduler;

  beforeEach(function () {
    scheduler = new Scheduler();
  });

  afterEach(function () {
    scheduler = {};
  });


  it('Add tasks', function () {
    let task = function dummyTaks(cb) {
      cb(null);
    }

    scheduler.addTask(task);

    let expectedNoOfTasks = 1;
    assert.lengthOf(scheduler.getTasks(), expectedNoOfTasks);
  });

  it('Run task', function (done) {
    let task = sinon.spy(function dummyTask(cb) {
      cb(null); // null = successful
    });

    scheduler.addTask(task);
    scheduler.run((err, reults) => {
      task.should.have.been.calledOnce;
     
      done(); // tell mocha we're done
    });
  });

  it('Run failing task', function (done) {
    let errorTask = sinon.spy(function dummyTask(cb) {
      cb('error', 'errorResult'); 
    });

    scheduler.addTask(errorTask);
    scheduler.run((err, results) => {
      errorTask.should.have.been.calledOnce;
      assert.equal(err, 'error');
      assert.equal(results, 'errorResult');

      done(); // tell mocha we're done
    });
  });

  it('Scheduler should stop if task fails', function (done) {
    let errorTask = sinon.spy(function dummyTask(cb) {
      cb('error', 'errorResult'); 
    });

    let task = sinon.spy(function dummyTask(cb) {
      cb(null); // null = successful
    });

    scheduler.addTask(errorTask);
    scheduler.addTask(task);

    scheduler.run((err, results) => {
      errorTask.should.have.been.calledOnce;
      task.should.not.have.been.called;

      assert.equal(err, 'error');
      assert.equal(results, 'errorResult');

      done(); // tell mocha we're done
    });
  }); 
});