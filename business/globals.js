var {PythonShell} = require("python-shell");
var path = require("path");
const {promisify} = require('util');
const isDev = require('electron-is-dev');

var pyshell;
var pyshellCopy;
var idIntervalFinderBackend = "";
var idIntervalFinderFile = "";
var idIntervalCopyFile = "";
var progress = 1;
var gAuxHistory = []