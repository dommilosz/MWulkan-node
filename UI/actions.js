const electron = require("electron");
const ipcMain = electron.ipcMain;
const $ = require("jquery");
const API = require("./../UONET_API");
const fs = require("fs");

ipcMain.on("login", (args, token, pin, symbol) => {
	try {
		JSON_RESP2 = API.Login(token, pin, symbol);

		if (!JSON_RESP2.isError && JSON_RESP2) {
			JSON_RESP = JSON_RESP2;
			try{
				fs.mkdirSync('./Data/')
			}catch{}
			try{
				fs.mkdirSync('./Data/auth')
			}catch{}
			accid = 0;
			try{
				files = fs.readdirSync('./Data/auth');
				accid = files.length;
			}catch{accid = 0;}
			try{
				fs.mkdirSync(`./Data/auth/${accid}`)
			}catch{}
			fs.writeFileSync(
				`./Data/auth/${accid}/auth.tk`,
				JSON.stringify(JSON_RESP),
				function () {}
			);
			args.sender.send("login-result",accid);
		} else {
			
		}
	} catch (ex) {

	}
});

ipcMain.on("getUsers", (args, json, accid) => {
	try {
		API.GetUsers(json[accid]).then(r=>{
			if (r.Data) {
				try{
					fs.mkdirSync('./Data/')
				}catch{}
				fs.writeFileSync(
					`./Data/auth/${accid}/users.dt`,
					JSON.stringify(r),
					function () {}
				);
				args.sender.send("result");
				
			} else {
				
			}
		});
	} catch (ex) {

	}
});

ipcMain.on("getTimetable", (args, json,userjson,date,id) => {
	try {
		idf = id.split('#');
		seljson = json[idf[0]];
		seluserjson = userjson[idf[0]]
		API.GetTimetable(seljson,seluserjson,id,date).then(r=>{
			if (r.Data) {
				try{
					fs.mkdirSync('./Data/')
				}catch{}
				try{
					fs.mkdirSync('./Data/usr')
				}catch{}
				try{
					fs.mkdirSync(`./Data/usr/${id}`)
				}catch{}
				fs.writeFileSync(
					`./Data/usr/${id}/timetable.dt`,
					JSON.stringify(r),
					function () {}
				);
				args.sender.send("result");
			} else {
				
			}
		});
	} catch (ex) {

	}
});

ipcMain.on("getOceny", (args, json,userjson,id) => {
	try {
		idf = id.split('#');
		seljson = json[idf[0]];
		seluserjson =userjson[idf[0]] ;
		API.GetOceny(seljson,seluserjson,idf[1]).then(r=>{
			idf = id.split('#');
			if (r.Data) {
				try{
					fs.mkdirSync('./Data/')
				}catch{}
				try{
					fs.mkdirSync('./Data/auth')
				}catch{}
				try{
					fs.mkdirSync(`./Data/auth/${idf[0]}`)
				}catch{}
				try{
					fs.mkdirSync(`./Data/auth/${idf[0]}/${idf[1]}`)
				}catch{}
				fs.writeFileSync(
					`./Data/auth/${idf[0]}/${idf[1]}/oceny.dt`,
					JSON.stringify(r),
					function () {}
				);
				args.sender.send("result");
			} else {
				
			}
		});
	} catch (ex) {
		
	}
});

ipcMain.on("getSlowniki", (args, json, usersjson, userid) => {
	try {
		idf = userid.split('#')
		try{
			data = JSON.parse(fs.readFileSync(`./Data/auth/${idf[0]}/${idf[1]}/slowniki.dt`))
			args.sender.send("result");
		}catch{
		seljson = json[idf[0]];
		selusersjson =usersjson[idf[0]] ;
		API.GetSlowniki(seljson,selusersjson,idf[1]).then(r=>{
			if (r.TimeKey) {
				try{
					fs.mkdirSync('./Data/')
				}catch{}
				try{
					fs.mkdirSync('./Data/auth')
				}catch{}
				try{
					fs.mkdirSync(`./Data/auth/${idf[0]}`)
				}catch{}
				try{
					fs.mkdirSync(`./Data/auth/${idf[0]}/${idf[1]}`)
				}catch{}
				fs.writeFileSync(
					`./Data/auth/${idf[0]}/${idf[1]}/slowniki.dt`,
					JSON.stringify(r),
					function () {}
				);
				
					args.sender.send("result");
				
			} else {
				
			}
		});}
	} catch (ex) {
		
	}
});
ipcMain.on("parseOceny", (args, oceny,slowniki,userid) => {
	data = oceny;
	slowniki = slowniki.Data;
	data.Data.forEach(el => {
		slowniki.Przedmioty.forEach(el2 => {
			if(el2.Id == el['IdPrzedmiot']){
				el['IdPrzedmiot'] = el2;
			}
		});
		slowniki.KategorieOcen.forEach(el2 => {
			if(el2.Id == el['IdKategoria']){
				el['IdKategoria'] = el2;
			}
		});
		slowniki.Nauczyciele.forEach(el2 => {
			if(el2.Id == el['IdPracownikD']){
				el['IdPracownikD'] = el2;
			}
		});
		slowniki.Nauczyciele.forEach(el2 => {
			if(el2.Id == el['IdPracownikM']){
				el['IdPracownikM'] = el2;
			}
		});
	});
	args.sender.send("parseOceny-result", data,userid);
});

