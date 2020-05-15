const puppeteer = require("puppeteer");
module.exports.GetSign = function (token, content) {
    return p  = new Promise((resolve, reject) => {
        (async () => {
            pass = "CE75EA598C7743AD9B0B7328DED85B06";
            const browser = await puppeteer.launch({ devtools: true });
            const page = await browser.newPage();
            var path = require('path');
            var appDir = path.dirname(require.main.filename);
            await page.goto(`${appDir}/Signer/signer.html?p=${pass}&c=${token}&b=${JSON.stringify(content)}`);
            await page.waitForSelector('#LOADED')
            body = await page.evaluate(()=>{
                return document.getElementById('LOADED').innerHTML;
            })
            await browser.close()
            resolve(body);
        })();
    }
    )
};
