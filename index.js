const express = require('express');
const path = require('path');
var config = require(path.join(__dirname, "/src/config"));
console.log(config.get('server:port'));
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const util = require('util');

process.title = 'push-deploy';

var app = express();

app.use(bodyParser());
app.use(methodOverride());

app.get('/', function (req, res) {
    res.send("I'm working here.");
});

app.post('/deploy', function (req, res) {
    console.log('post detected...');
    let shellOptions = ['deploy.sh',
        config.get('git:work_dir'),
        config.get('git:branch'),
        config.get('git:repo_dir'),
        "",
        config.get('docker:container')
    ];
    //var spawn = require('child_process').spawn;
    require('child_process').spawn('/bin/bash', shellOptions, {stdio: 'inherit'});
    let stdout= '';
    //child.stdout.on('data', function(buf) {
    //    console.log('[STR] stdout "%s"', String(buf));
    //    stdout += buf;
    //});
    res.send("Done");
});

app.listen(8010, function () {
    console.log('Start listen on 8010!');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});