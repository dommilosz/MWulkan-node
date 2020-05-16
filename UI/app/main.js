sel_user = "0#0";
function getUsers() {
	ipcRenderer.send("getUsers", JSON_RESP);
}
function GetTimetable() {
	getSlowniki();
	id = document.getElementById("users").value;
	if (id >= 0)
		ipcRenderer.send(
			"getTimetable",
			JSON_RESP,
			JSON_USERS,
			"2020-05-11",
			id
		);
}
function getOceny() {
	getSlowniki();
	id = sel_user;
	if (id.length >= 3) ipcRenderer.send("getOceny", JSON_RESP, JSON_USERS, id);
}
function getSlowniki() {
	id = sel_user;
	if (id.length >= 3)
		ipcRenderer.send("getSlowniki", JSON_RESP, JSON_USERS, id);
}
ipcRenderer.on("getUsers-result", (e, result) => {
	if (!result.error) {
		SuccesLogger.log("getUsers() succes");
		JSON_USERS = result;
		USERS_ARR = [];
		document.getElementById("users").innerHTML =
			'<option value="-1">WYBIERZ UCZNIA</option>';
		result.Data.forEach((el, i) => {
			USERS_ARR.push(el.Imie + " " + el.Nazwisko + " (" + el.Id + ")");
			document.getElementById("users").innerHTML += `<option value=${i}>${
				el.Imie + " " + el.Nazwisko + " (" + el.Id + ")"
			}</select>`;
		});
	} else {
		ErrorLogger.log("ERROR while getUsers()");
		ErrorLogger.debug(result);
		if (JSON_RESP.error) {
			document.getElementById("users").innerHTML = "USERS : ERROR";
		}
	}
});
ipcRenderer.on("getTimetable-result", (e, result) => {
	if (!result.error) {
		SuccesLogger.log("getTimetable() succes");
		JSON_USERS = result;
		USERS_ARR = [];
		result.Data.forEach((el) => {
			USERS_ARR.push(el.Imie + " " + el.Nazwisko + " (" + el.Id + ")");
		});
		document.getElementById("users").innerHTML = USERS_ARR;
	} else {
		ErrorLogger.log("ERROR while getTimetable()");
		ErrorLogger.debug(result);
		if (JSON_RESP.error) {
			document.getElementById("users").innerHTML = "USERS : ERROR";
		}
	}
});
ipcRenderer.on("getOceny-result", (e, result, userid) => {
	if (!result.error) {
		SuccesLogger.log("getOceny() succes");
		OCENY[userid] = result;
		ParseOceny(userid);
	} else {
		ErrorLogger.log("ERROR while getOceny()");
		ErrorLogger.debug(result);
	}
});
ipcRenderer.on("getSlowniki-result", (e, result, userid) => {
	if (!result.error) {
		SuccesLogger.log("getSlowniki() succes");
		SLOWNIKI[userid] = result;
	} else {
		ErrorLogger.log("ERROR while getSlowniki()");
		ErrorLogger.debug(result);
	}
});
ipcRenderer.on("parseOceny-result", (event, result, userid) => {
	useridf = userid.split("#");
	if (!OCENY_PARSED[useridf[0]]) OCENY_PARSED[useridf[0]] = {};
	OCENY_PARSED[useridf[0]][useridf[1]] = result;
	Render(userid);
});
function ParseOceny(userid) {
	useridf = userid.split("#");
	ipcRenderer.send(
		"parseOceny",
		OCENY[useridf[0]][useridf[1]],
		SLOWNIKI[useridf[0]][useridf[1]],
		userid
	);
}
function TryGetTokenFromFIle() {
	try {
		usrs = fs.readdirSync("./Data/auth");
		usrs.forEach((el) => {
			try {
				JSON_RESP[parseInt(el)] = JSON.parse(
					fs.readFileSync("./Data/auth/" + el + "/auth.tk")
				);
			} catch {}
		});
		SuccesLogger.log("Token succesfully loaded from file");
	} catch (ex) {
		ErrorLogger.log("ERROR while loading token");
		ErrorLogger.debug(ex);
	}
	try {
		usrs = fs.readdirSync("./Data/auth");
		usrs.forEach((el) => {
			try {
				JSON_USERS[parseInt(el)] = JSON.parse(
					fs.readFileSync("./Data/auth/" + el + "/users.dt")
				);
			} catch {}
		});
		result = JSON_USERS;
		USERS_ARR = [];

		SuccesLogger.log("Users succesfully loaded from file");
	} catch (ex) {
		ErrorLogger.log("ERROR while loading users");
		ErrorLogger.debug(ex);
	}
	try {
		dir1 = fs.readdirSync("./Data/auth");
		dir1.forEach((el) => {
			try {
				dir2 = fs.readdirSync("./Data/auth/" + el);

				dir2.forEach((el2) => {
					if (!OCENY[el]) OCENY[el] = [];
					if (!SLOWNIKI[el]) SLOWNIKI[el] = [];
					if (!Timetables[el]) Timetables[el] = [];
					if (el2.length == 1) {
						try {
							OCENY[el][el2] = JSON.parse(
								fs.readFileSync(
									"./Data/auth/" +
										el +
										"/" +
										el2 +
										"/oceny.dt"
								)
							);
						} catch {}

						try {
							SLOWNIKI[el][el2] = JSON.parse(
								fs.readFileSync(
									"./Data/auth/" +
										el +
										"/" +
										el2 +
										"/slowniki.dt"
								)
							);
						} catch {}
						try {
							Timetables[el][el2] = JSON.parse(
								fs.readFileSync(
									"./Data/auth/" +
										el +
										"/" +
										el2 +
										"/timetable.dt"
								)
							);
						} catch {}
						ParseOceny(el + "#" + el2);
					}
				});
			} catch {}
		});

		SuccesLogger.log(`Oceny & Slowniki succesfully loaded from file`);
	} catch (ex) {
		ErrorLogger.log("ERROR while loading Oceny & Slowniki");
		ErrorLogger.debug(ex);
	}
}
function LogIn() {
	token = $("#inp_token")[0].value;
	pin = $("#inp_pin")[0].value;
	symbol = $("#inp_symbol")[0].value;
	ipcRenderer.send("login", token, pin, symbol);
}
function OnLoad() {
	TryGetTokenFromFIle();
	Render();
}

function Render() {
	usersdiv = document.getElementById("users-users");
	usersdiv.innerHTML = "";
	try {
		JSON_USERS.forEach((el1, i) => {
			el1.Data.forEach((el2, i2) => {
				html = `<div class="user" value='${i}#${i2}' onclick="SelUser('${i}#${i2}')">${el2.Imie} ${el2.Nazwisko} ${el2.OddzialKod}
				</div>`;
				usersdiv.innerHTML += html;
			});
		});
	} catch {}
	SelUser(sel_user, true);
	try {
		userid = sel_user;
		useridf = userid.split("#");
		oceny_arr = {};
		html_oceny = ``;
		OCENY_PARSED[useridf[0]][useridf[1]].Data.forEach((element) => {
			if (!oceny_arr[element.IdPrzedmiot.Kod])
				oceny_arr[element.IdPrzedmiot.Kod] = [];
			oceny_arr[element.IdPrzedmiot.Kod].push(element);
		});
		$.each(oceny_arr, function (i, el) {
			wpisy = "";
			html += `<tr id='s_${el[0].IdPrzedmiot.Kod}'>`;
			html += `<td>${el[0].IdPrzedmiot.Nazwa}</td>`;
			el.forEach((el2) => {
				wpisy += `<div class="oc_wpis">${el2.Wpis} </div>`;
			});
			html += `</tr>`;

			html_oceny += `
		<div class="oc_item" id='s_${el[0].IdPrzedmiot.Kod}'>
			<div class="oc_item_item small"><div class='align-middle' style='font-size: 15px;'>${el[0].IdPrzedmiot.Nazwa}</div></div>
			<div class="oc_item_item big" style='justify-content:left;'><pre class='align-middle' style='margin-left: 10px;'>${wpisy}</pre></div>
			<div class="oc_item_item small"><div class='align-middle'>5</div></div>
		</div>
		`;
		});
		document.getElementsByClassName("oc_items")[0].innerHTML = html_oceny;
	} catch {}
}

function SelUser(userid, ignore_rerender) {
	sel_user = userid;
	document.querySelectorAll(".user").forEach((el) => {
		el.className = "user";
		if (el.attributes.value.textContent == userid) {
			el.className = "user selected";
		}
	});
	if (!ignore_rerender) Render();
}
