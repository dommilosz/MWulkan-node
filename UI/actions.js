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
			fs.writeFileSync(
				"./Data/auth.tk",
				JSON.stringify(JSON_RESP),
				function () {}
			);
			args.sender.send("login-result", JSON_RESP);
		} else {
			args.sender.send("login-result", { error: JSON_RESP2 });
		}
	} catch (ex) {
		args.sender.send("login-result", { error: ex });
	}
});

ipcMain.on("getUsers", (args, json) => {
	try {
		API.GetUsers(json).then(r=>{
			if (r.Data) {
				try{
					fs.mkdirSync('./Data/')
				}catch{}
				fs.writeFileSync(
					"./Data/users.dt",
					JSON.stringify(r),
					function () {}
				);
				args.sender.send("getUsers-result", r);
			} else {
				args.sender.send("getUsers-result", { error: r});
			}
		});
	} catch (ex) {
		args.sender.send("getUsers-result", { error: ex });
	}
});

ipcMain.on("getTimetable", (args, json,userjson,date,id) => {
	try {
		API.GetTimetable(json,userjson,id,date).then(r=>{
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
				args.sender.send("getTimetable-result", r);
			} else {
				args.sender.send("getTimetable-result", { error: r});
			}
		});
	} catch (ex) {
		args.sender.send("getTimetable-result", { error: ex });
	}
});

ipcMain.on("getOceny", (args, json,userjson,id) => {
	try {
		API.GetOceny(json,userjson,id).then(r=>{
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
					`./Data/usr/${id}/oceny.dt`,
					JSON.stringify(r),
					function () {}
				);
				args.sender.send("getOceny-result", r,id);
			} else {
				args.sender.send("getOceny-result", { error: r});
			}
		});
	} catch (ex) {
		args.sender.send("getOceny-result", { error: ex });
	}
});

ipcMain.on("getSlowniki", (args, json, usersjson, userid) => {
	try {
		try{
			data = JSON.parse(fs.readFileSync(`./Data/usr/${userid}/slowniki.dt`).toString('utf-8'))
			args.sender.send("getSlowniki-result", data,userid);
		}catch{
		API.GetSlowniki(json,usersjson,userid).then(r=>{
			if (r.TimeKey) {
				try{
					fs.mkdirSync('./Data/')
				}catch{}
				try{
					fs.mkdirSync('./Data/usr')
				}catch{}
				try{
					fs.mkdirSync(`./Data/usr/${userid}`)
				}catch{}
				fs.writeFileSync(
					`./Data/usr/${userid}/slowniki.dt`,
					JSON.stringify(r),
					function () {}
				);
				args.sender.send("getSlowniki-result", r,userid);
			} else {
				args.sender.send("getSlowniki-result", { error: r});
			}
		});}
	} catch (ex) {
		args.sender.send("getSlowniki-result", { error: ex });
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

