
const electron      = require('electron')
const ipcRenderer   = electron.ipcRenderer
const $             = require('jquery')
const API           = require('../../UONET_API');
const fs            = require('fs');
const loggerutil    = require('../loggerutil');

const SuccesLogger  = new loggerutil('%c[MWULKAN]','color: #00ff4c; font-weight: bold')
const ErrorLogger  = new loggerutil('%c[MWULKAN]','color: red; font-weight: bold')

JSON_RESP = [];
JSON_USERS = [];
USERS_ARR = [];
Timetables =[];
SLOWNIKI = [];
OCENY = [];
OCENY_PARSED = [];

function ChangeUI(UI){
    document.querySelectorAll('.display-container').forEach(e => {
        e.style.display = 'none';
    });
    document.getElementById(UI).style.display = 'unset';
}
function ChangeUUI(UI){
    document.querySelectorAll('.under-display-container').forEach(e => {
        e.style.display = 'none';
    });
    document.getElementById(UI).style.display = 'unset';
}
