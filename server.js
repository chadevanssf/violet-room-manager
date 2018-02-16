'use strict';

// use the environment var from Heroku if set
const IS_DEBUG = process.env.NODE_ENV != "production";

var violetSrvr = require('violet/lib/violetSrvr')('/alexa');
violetSrvr.listAppsAt('/');
var srvrInstance = violetSrvr.createAndListen(process.env.PORT || 8080);

violetSrvr = require('violet/lib/violetClientTx')(violetSrvr, srvrInstance);

violetSrvr.loadScript(process.env.SCRIPT_NAME || 'scripts/room-manager.js', 'room-manager');


console.log('Waiting for requests...');
