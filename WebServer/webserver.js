//this module exposes functions and variables to control the HTTP server.
const http = require("http"); //to serve the pages
module.exports.server = require('express')();
module.exports.port = 8080;
const fs = require("fs"); //to read the webpages from disk

module.exports.Create = function(){
	module.exports.server.listen(this.port);
}

module.exports.GetParams = function(req){
	url = req.originalUrl
	args = {}
    
    url.split('?')[1].split('&').forEach(e =>{
        args[e.split('=')[0]] = (e.split('='))[1]

    })

	return args
}





