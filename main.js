const API = require("./UONET_API");
const fs = require("fs");
const Signer = require('./Signer/signer-get');
JSON_RESP = {};
console.log(process.argv);

try {
	tmp = fs.readFileSync("./auth.tk")
        JSON_RESP = JSON.parse(tmp.toString());
} catch {
	JSON_RESP = API.Login("", "", "");
	if (!JSON_RESP.isError) {
		fs.writeFileSync(
			"./auth.tk",
			JSON.stringify(JSON_RESP),
			function () {}
		);
	}
}
API.Login("", "", "")
resp = API.GetUsers(JSON_RESP).then(users=>{
	console.log(users);
});

