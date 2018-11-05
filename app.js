var express = require('express');
const PORT = process.env.PORT
// const PORT = 3000
var debug = require('debug')
var bodyParser = require("body-parser");
const puppeteer = require('puppeteer');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send("G5 Page Renderer");
});

app.post('/rendered_page', function(req, res){
  var pageURL=req.body.url;

  async function getPage() {

    const browser = await puppeteer.launch({ args: ['--no-sandbox',
                                                    '--disable-setuid-sandbox',
                                                    '--disable-dev-shm-usage',
                                                    '--single-process'] });
    const page = await browser.newPage();

    await page.goto(pageURL, { networkIdleTimeout: 5000,
                               timeout: 10000 })

    await Promise.race([
      page.waitForNavigation({waitUntil: 'networkidle0'}),
      page.waitFor(5000)
    ]);

    let theDOM = await page.evaluate(() => document.documentElement.outerHTML);

    await browser.close();

    return theDOM
  }

  getPage().then((body)=>{res.send(body);});
  
});

app.listen(PORT);
