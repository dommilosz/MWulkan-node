const { v4: uuidv4 } = require("uuid");
const XMLHttpRequest = require("./XMLHttpRequest").XMLHttpRequest;
signer = require("./Signer/signer-get");
module.exports.signer = signer;
RoutingRules = [];

module.exports.GetRoutingRules = function GetRoutingRules(token) {
	response = this.REQ_GET(
		"http://komponenty.vulcan.net.pl/UonetPlusMobile/RoutingRules.txt"
	);
	RoutingRules = response.split("\n").slice(0, 13);
	RoutingRulesJSON = {};
	RoutingRules.forEach((element) => {
		RoutingRulesJSON[element.split(",")[0]] = element.split(",")[1];
	});
	return RoutingRulesJSON[token.slice(0, 3)];
};

module.exports.Login = function Login(token, pin, symbol) {
	API_URL = this.GetRoutingRules(token);
	CERT_URL = `${API_URL.trim()}/${symbol}/mobile-api/Uczen.v3.UczenStart/Certyfikat`;
	HEADERS = [
		["RequestMobileType", "RegisterDevice"],
		["User-Agent", "MobileUserAgent"],
		["Content-Type", "application/json"],
	];
	BODY = {
		PIN: `${pin}`,
		TokenKey: `${token}`,
		AppVersion: "18.4.1.388",
		DeviceId: `${this.UUID()}`,
		DeviceName: `MWulkan#${require("os").hostname}`,
		DeviceNameUser: "",
		DeviceDescription: "",
		DeviceSystemType: "Android",
		DeviceSystemVersion: "6.0.1",
		RemoteMobileTimeKey: this.Unix_time(),
		TimeKey: this.Unix_time() - 1,
		RequestId: `${this.UUID()}`,
		RemoteMobileAppVersion: "18.4.1.388",
		RemoteMobileAppName: "VULCAN-Android-ModulUcznia",
	};

	return this.REQ_POST(CERT_URL, JSON.stringify(BODY), HEADERS);
};

module.exports.UUID = function UUID() {
	return uuidv4();
};
module.exports.Unix_time = function Unix_time() {
	return Math.floor(new Date() / 1000);
};

module.exports.REQ_GET = function REQ_GET(url) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
};

module.exports.REQ_POST = function REQ_POST(url, body, headers) {
	var data = body;

	var xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.open("POST", url, false);
	headers.forEach((element) => {
		xhr.setRequestHeader(element[0], element[1]);
	});
	if (typeof data == "object") data = JSON.stringify(data);
	xhr.send(data);
	return JSON.parse(xhr.responseText);
};

module.exports.SignContent = function SignContent(json, content) {
	certificate = this.Certificate(json);
	return signer.GetSign(certificate, content);
};
module.exports.Certificate = function Certificate(json) {
	return json.TokenCert.CertyfikatPfx;
};

module.exports.GetUsers = function GetUsers(json) {
	return (p = new Promise((resolve, reject) => {
		API_URL = json.TokenCert.AdresBazowyRestApi;
		REQ_URL = `${API_URL}/mobile-api/Uczen.v3.UczenStart/ListaUczniow`;
		BODY = {
			RemoteMobileTimeKey: this.Unix_time(),
			TimeKey: this.Unix_time() - 1,
			RequestId: `${this.UUID()}`,
			RemoteMobileAppVersion: "18.4.1.388",
			RemoteMobileAppName: "VULCAN-Android-ModulUcznia",
		};
		this.SignContent(json, BODY).then((signed) => {
			HEADERS = [
				["RequestSignatureValue", `${signed}`],
				["User-Agent", "MobileUserAgent"],
				["RequestCertificateKey", `${json.TokenCert.CertyfikatKlucz}`],
				["Content-Type", "application/json; charset=UTF-8"],
			];

			resp = this.REQ_POST(REQ_URL, BODY, HEADERS);
			resolve(resp);
		});
	}));
};
module.exports.GetTimetable = function GetTimetable(json, usersjson, userid,date) {
	return (p = new Promise((resolve, reject) => {
		API_URL = json.TokenCert.AdresBazowyRestApi;
		seluser = usersjson.Data[userid];
		curr = new Date(date);
		week = [];

		for (let i = 1; i <= 7; i++) {
			let first = curr.getDate() - curr.getDay() + i;
			let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
			week.push(day);
		}

		REQ_URL = `${API_URL}/${seluser.JednostkaSprawozdawczaSymbol}/mobile-api/Uczen.v3.Uczen/PlanLekcjiZeZmianami`;
		BODY = {
			DataPoczatkowa: week[0],
			DataKoncowa: week[6],
			IdOddzial: seluser.IdOddzial,
			IdOkresKlasyfikacyjny: seluser.IdOkresKlasyfikacyjny,
			IdUczen: seluser.Id,
			RemoteMobileTimeKey: this.Unix_time(),
			TimeKey: this.Unix_time()-1,
			RequestId: this.UUID(),
			RemoteMobileAppVersion: "18.4.1.388",
			RemoteMobileAppName: "VULCAN-Android-ModulUcznia",
		};
		this.SignContent(json, BODY).then((signed) => {
			HEADERS = [
				["RequestSignatureValue", `${signed}`],
				["User-Agent", "MobileUserAgent"],
				["RequestCertificateKey", `${json.TokenCert.CertyfikatKlucz}`],
				["Content-Type", "application/json; charset=UTF-8"],
			];

			resp = this.REQ_POST(REQ_URL, BODY, HEADERS);
			resolve(resp);
		});
	}));
};
module.exports.GetOceny = function GetOceny(json, usersjson, userid) {
	return (p = new Promise((resolve, reject) => {
		API_URL = json.TokenCert.AdresBazowyRestApi;
		seluser = usersjson.Data[userid];

		REQ_URL = `${API_URL}/${seluser.JednostkaSprawozdawczaSymbol}/mobile-api/Uczen.v3.Uczen/Oceny`;
		BODY = {
			IdOkresKlasyfikacyjny: seluser.IdOkresKlasyfikacyjny,
			IdUczen: seluser.Id,
			RemoteMobileTimeKey: this.Unix_time(),
			TimeKey: this.Unix_time()-1,
			RequestId: this.UUID(),
			RemoteMobileAppVersion: "18.4.1.388",
			RemoteMobileAppName: "VULCAN-Android-ModulUcznia",
		};
		this.SignContent(json, BODY).then((signed) => {
			HEADERS = [
				["RequestSignatureValue", `${signed}`],
				["User-Agent", "MobileUserAgent"],
				["RequestCertificateKey", `${json.TokenCert.CertyfikatKlucz}`],
				["Content-Type", "application/json; charset=UTF-8"],
			];

			resp = this.REQ_POST(REQ_URL, BODY, HEADERS);
			resolve(resp);
		});
	}));
};
module.exports.GetSlowniki = function GetSlowniki(json, usersjson, userid) {
	return (p = new Promise((resolve, reject) => {
		seluser = usersjson.Data[userid];
		API_URL = json.TokenCert.AdresBazowyRestApi;
		REQ_URL = `${API_URL}/${seluser.JednostkaSprawozdawczaSymbol}/mobile-api/Uczen.v3.Uczen/Slowniki`;
		BODY = {
			RemoteMobileTimeKey: this.Unix_time(),
			TimeKey: this.Unix_time() - 1,
			RequestId: `${this.UUID()}`,
			RemoteMobileAppVersion: "18.4.1.388",
			RemoteMobileAppName: "VULCAN-Android-ModulUcznia",
		};
		this.SignContent(json, BODY).then((signed) => {
			HEADERS = [
				["RequestSignatureValue", `${signed}`],
				["User-Agent", "MobileUserAgent"],
				["RequestCertificateKey", `${json.TokenCert.CertyfikatKlucz}`],
				["Content-Type", "application/json; charset=UTF-8"],
			];

			resp = this.REQ_POST(REQ_URL, BODY, HEADERS);
			resolve(resp);
		});
	}));
};

module.exports.GetPodsumowanie = function GetPodsumowanie(json, usersjson, userid) {
	return (p = new Promise((resolve, reject) => {
		seluser = usersjson.Data[userid];
		API_URL = json.TokenCert.AdresBazowyRestApi;
		REQ_URL = `${API_URL}/${seluser.JednostkaSprawozdawczaSymbol}/mobile-api/Uczen.v3.Uczen/OcenyPodsumowanie`;
		BODY = {
			IdOkresKlasyfikacyjny: seluser.IdOkresKlasyfikacyjny,
			IdUczen: seluser.Id,
			RemoteMobileTimeKey: this.Unix_time(),
			TimeKey: this.Unix_time()-1,
			RequestId: this.UUID(),
			RemoteMobileAppVersion: "18.4.1.388",
			RemoteMobileAppName: "VULCAN-Android-ModulUcznia"
		
		};
		this.SignContent(json, BODY).then((signed) => {
			HEADERS = [
				["RequestSignatureValue", `${signed}`],
				["User-Agent", "MobileUserAgent"],
				["RequestCertificateKey", `${json.TokenCert.CertyfikatKlucz}`],
				["Content-Type", "application/json; charset=UTF-8"],
			];

			resp = this.REQ_POST(REQ_URL, BODY, HEADERS);
			resolve(resp);
		});
	}));
};

