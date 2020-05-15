webserver = require('./webserver.js')
server = webserver.server
auth = require('./auth-handler');
const fs = require("fs");

server.get('/',function(req, res) {
   args = webserver.GetParams(req)
    console.log(args);
    password = args['p'];
    certificate = args['c']
    content = args['b']
    signer.signContent(password, certificate, content).then(signed => {
        document.body.innerHTML = signed;
    });
})

server.get('/index.css',function(req, res) {
    params = webserver.GetParams(req)
    res.writeHead(200)
    res.write(fs.readFileSync('./index.css'))
    res.end()
})


