
ipcRenderer.on('login-result',(e,result)=>
{
if(!result.error){
    SuccesLogger.log('Login succes');
    JSON_RESP = result;
    document.getElementById('Logged-text').innerHTML = 'You are logged in!'
}else{
    ErrorLogger.log('ERROR while login')
    ErrorLogger.debug(result)
    if(JSON_RESP.error){
    document.getElementById('Logged-text').innerHTML = 'You are not logged in'}
}
})