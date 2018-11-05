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
    let browser = await puppeteer.launch({ headless: true, 
                                           args: ['--no-sandbox',
                                                  '--disable-setuid-sandbox',
                                                  '--disable-dev-shm-usage',
                                                  '--single-process'] });
    let page = await browser.newPage();

    // Let's speed this thing up by not loading any images
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.resourceType() === 'image')
        request.abort();
      else
        request.continue();
    });

    await page.goto(pageURL)

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
