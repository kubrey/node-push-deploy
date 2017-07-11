const nconf = require('nconf');
const path = require('path');

let env = process.argv[2] ? process.argv[2] : (process.env.DEBUG ? 'development' : 'production');


let confFile = env === 'development' ? 'config_test.json' : 'config.json';

nconf.argv().env().file({file: path.join(__dirname, confFile)});

module.exports = nconf;

