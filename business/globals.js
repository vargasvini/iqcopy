var {PythonShell} = require("python-shell");
var path = require("path");
const {promisify} = require('util');
var Enumerable = require('linq');
const isDev = require('electron-is-dev');
const { dialog } = require('electron').remote
const remote = require('electron').remote

var pyshell;
var pyshellCopy;
var pyshellInstaller;
var idIntervalFinderBackend = "";
var idIntervalFinderFile = "";
var idIntervalCopyFile = "";
var progress = 1;
var gAuxHistory = []
var gTopTradersList = []
var gApiUrl = ""
var gToken = ""

if(!isDev){
    gApiUrl = 'http://localhost:8085/api'
}else{
    gApiUrl = 'https://meutrader.com/api'
}