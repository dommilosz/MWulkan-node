function Login() {
	token = $("#inp_Token")[0].value;
	pin = $("#inp_PIN")[0].value;
	symbol = $("#inp_Symbol")[0].value;
	ipcRenderer.send("login", token, pin, symbol);
}