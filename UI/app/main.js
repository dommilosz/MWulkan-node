function getUsers(){
    ipcRenderer.send('getUsers',JSON_RESP)
}
function GetTimetable(){
    getSlowniki();
    id = document.getElementById('users').value;
    if(id>=0)
    ipcRenderer.send('getTimetable',JSON_RESP,JSON_USERS,'2020-05-11',id)
}
function getOceny(){
    getSlowniki();
    id = document.getElementById('users').value;
    if(id>=0)
    ipcRenderer.send('getOceny',JSON_RESP,JSON_USERS,id)
}
function getSlowniki(){
    id = document.getElementById('users').value;
    if(id>=0)
    ipcRenderer.send('getSlowniki',JSON_RESP,JSON_USERS,id)
}
ipcRenderer.on('getUsers-result',(e,result)=>
{
    if(!result.error){
        SuccesLogger.log('getUsers() succes');
        JSON_USERS = result;
        USERS_ARR = [];
        document.getElementById('users').innerHTML = '<option value="-1">WYBIERZ UCZNIA</option>';
        result.Data.forEach((el,i) => {
            USERS_ARR.push( el.Imie + " "+el.Nazwisko + " ("+el.Id+")")
            document.getElementById('users').innerHTML +=  `<option value=${i}>${el.Imie + " "+el.Nazwisko + " ("+el.Id+")"}</select>`
        });

    }else{
        ErrorLogger.log('ERROR while getUsers()')
        ErrorLogger.debug(result)
        if(JSON_RESP.error){
        document.getElementById('users').innerHTML = 'USERS : ERROR'}
    }
})
ipcRenderer.on('getTimetable-result',(e,result)=>
{
    if(!result.error){
        SuccesLogger.log('getTimetable() succes');
        JSON_USERS = result;
        USERS_ARR = [];
        result.Data.forEach(el => {
            USERS_ARR.push( el.Imie + " "+el.Nazwisko + " ("+el.Id+")")
        });
        document.getElementById('users').innerHTML = USERS_ARR
    }else{
        ErrorLogger.log('ERROR while getTimetable()')
        ErrorLogger.debug(result)
        if(JSON_RESP.error){
        document.getElementById('users').innerHTML = 'USERS : ERROR'}
    }
})
ipcRenderer.on('getOceny-result',(e,result,userid)=>
{
    if(!result.error){
        SuccesLogger.log('getOceny() succes');
        OCENY[userid] = result
        ParseOceny(userid);
    }else{
        ErrorLogger.log('ERROR while getOceny()')
        ErrorLogger.debug(result)
    }
})
ipcRenderer.on('getSlowniki-result',(e,result,userid)=>
{
    if(!result.error){
        SuccesLogger.log('getSlowniki() succes');
        SLOWNIKI[userid] = result;
    }else{
        ErrorLogger.log('ERROR while getSlowniki()')
        ErrorLogger.debug(result)
    }
})
ipcRenderer.on('parseOceny-result',(event,result,userid)=>{
    OCENY_PARSED[userid] = result;
    RenderOceny(userid)
})
function ParseOceny(userid){
    ipcRenderer.send('parseOceny',OCENY[userid],SLOWNIKI[userid],userid)
}
function RenderOceny(userid){
    oceny_arr = {};
    html = ``;
    OCENY_PARSED[userid].Data.forEach(element => {
        if(!oceny_arr[element.IdPrzedmiot.Kod])oceny_arr[element.IdPrzedmiot.Kod] = []
        oceny_arr[element.IdPrzedmiot.Kod].push(element); 
        
    });
    $.each(oceny_arr, function(i, el) {
        html+=`<tr id='s_${el[0].IdPrzedmiot.Kod}'>`
        html+=`<td>${el[0].IdPrzedmiot.Nazwa}</td>`
        el.forEach(el2=>{
            html+=`<td>${el2.Wpis}</td>`
        })
        html+=`</tr>`
      });
      document.getElementById('oceny-oceny').innerHTML = html
}
function TryGetTokenFromFIle(){
    try{
        JSON_RESP = JSON.parse(fs.readFileSync('./Data/auth.tk'))
        SuccesLogger.log('Token succesfully loaded from file')
        document.getElementById('Logged-text').innerHTML = 'You are logged in!'
    }catch (ex){
        ErrorLogger.log('ERROR while loading token')
        ErrorLogger.debug(ex)
    }
    try{
        JSON_USERS = JSON.parse(fs.readFileSync('./Data/users.dt'))
        result = JSON_USERS;
        USERS_ARR = [];
        document.getElementById('users').innerHTML = '<option value="-1">WYBIERZ UCZNIA</option>';
        result.Data.forEach((el,i) => {
            USERS_ARR.push( el.Imie + " "+el.Nazwisko + " ("+el.Id+")")
            document.getElementById('users').innerHTML +=  `<option value=${i}>${el.Imie + " "+el.Nazwisko + " ("+el.Id+")"}</select>`
        });
        SuccesLogger.log('Users succesfully loaded from file')
    }catch (ex){
        ErrorLogger.log('ERROR while loading users')
        ErrorLogger.debug(ex)
    }
}
function LogIn(){
    
    token = $('#inp_token')[0].value;
    pin = $('#inp_pin')[0].value;
    symbol = $('#inp_symbol')[0].value;
    ipcRenderer.send('login',token,pin,symbol)

}
function OnLoad(){
    TryGetTokenFromFIle()
}