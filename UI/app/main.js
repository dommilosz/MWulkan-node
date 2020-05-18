
sel_user = "0#0";
function getUsers(accid) {
	return actions.getUsers(JSON_RESP, accid);
}
function GetTimetable() {}
function getOceny() {
	return (p = new Promise((resolve, reject) => {
	getSlowniki().then(_=>{
		id = sel_user;
		if (id.length >= 3) actions.getOceny(JSON_RESP, JSON_USERS, id).then(_=>{resolve();});
	});}))
	
}
function getSlowniki() {
	id = sel_user;
	if (id.length >= 3) return actions.getSlowniki(JSON_RESP, JSON_USERS, id);
}

function ParseOceny(userid) {
	useridf = userid.split("#");
	return actions.parseOceny(
		OCENY[useridf[0]][useridf[1]],
		SLOWNIKI[useridf[0]][useridf[1]],
		userid
	).then(data=>{
		result = data[0]
		userid = data[1];
		useridf = userid.split("#");
		if (!OCENY_PARSED[useridf[0]]) OCENY_PARSED[useridf[0]] = {};
		OCENY_PARSED[useridf[0]][useridf[1]] = result;
		Render(userid);
	});
}
function FromFIle() {
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
	Render();
}
function OnLoad() {
	FromFIle();
	Render();
	ChangeUUI("none");
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
				wpisy += `<div class="oc_wpis" onmouseover="showOcenaDetails(this,true)" onmouseout="showOcenaDetails(this,false)">${el2.Wpis}<div class='ocena_info' style='display:none;'>${JSON.stringify(el2)}</div><div class='ocena_info_popup' style='display:none;'></div> </div>`;
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

function Reload() {
	document.getElementsByClassName('reload-btn')[0].style.color = 'orange';
	getUsers(sel_user.split("#")[0]).then(_=>{
		
		selview = document.querySelector(
			'.under-display-container[style="display: unset;"]'
		).id;
		if (selview == "oceny") {
			getOceny().then(_=>{
				document.getElementsByClassName('reload-btn')[0].style.color = 'lime';
				FromFIle()
			});
		}else
		if (selview == "plan") {
		}else document.getElementsByClassName('reload-btn')[0].style.color = 'lime';
	});
	
}
function showOcenaDetails(sender,show){
	var details = sender.getElementsByClassName('ocena_info')[0];
	var json = JSON.parse( details.innerHTML);
	var popup = sender.getElementsByClassName('ocena_info_popup')[0];
	if(json.WagaModyfikatora==null)
	json.WagaModyfikatora = 0;
	var wartosc_oceny = json.Wartosc + json.WagaModyfikatora;
	if(!json.Opis||json.Opis=='')json.Opis = '-';
	if(!json.IdKategoria.Nazwa)json.IdKategoria.Nazwa = '-';
	opis_arr =json.Opis.split(' ');
	opis_arr2 = [];
	while(opis_arr.join(' ').length>29){
		opis_arr2.unshift(opis_arr[opis_arr.length-1])
		opis_arr = opis_arr.slice(0,opis_arr.length-1);
	}

	html = `
	<div class='ocena_popup' style='display:inherit;'>
		<div class='oc_popup_item'>OCENA      : <div>${json.Wpis} (${wartosc_oceny})</div></div>
        <div class='oc_popup_item'>WAGA       : <div>${json.WagaOceny}</div></div>
        <div class='oc_popup_item'>KATEGORIA  : <div>${json.IdKategoria.Nazwa}</div></div>
		<div class='oc_popup_item'>OPIS       : <div class=''>${opis_arr.join(' ')}</div></div>
		<div class='oc_popup_item'><div class=''>${opis_arr2.join(' ')}</div></div>
        <div class='oc_popup_item'>NAUCZYCIEL : <div class=''>${json.IdPracownikM.Imie} ${json.IdPracownikM.Nazwisko}</div></div> </div>
	`;
	popup.innerHTML = html;
	
	if(show){
		popup.style.display = 'grid';
	}
	if(!show){
		popup.style.display = 'none';
	}
	var bodyRect = document.body.getBoundingClientRect(),
    elemRect = popup.getBoundingClientRect(),
	offset   = -(elemRect.top - bodyRect.bottom)
	popup.style.top = '45px';
	if(offset<=135){
		popup.style.top = '-135px';
	}

}