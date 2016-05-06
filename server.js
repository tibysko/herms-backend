var express = require('express');
var taskHeating = require('./taskHeating');
var taskVort = require('./taskVort');

var app = express();

var intervallTime = 1000;
var heating = new taskHeating(intervallTime);
var vort = new taskVort(intervallTime);

app.get('/heating/start', function (req, res) {
   heating.start();
   res.send("heating Started");
});

app.get('/heating/stop', function (req, res) {
   heating.stop();
   res.send("heating Stoped");
});

app.get('/vort/start', function (req, res) {
   vort.start();
   res.send("vort Started");
});

app.get('/vort/stop', function (req, res) {
   vort.stop();
   res.send("vort Stoped");
});

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});


