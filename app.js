var express = require('express');
const PORT = process.env.PORT
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

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(pageURL, {
      waitUntil: 'networkidle2'
    });

    let bodyHTML = await page.evaluate(() => document.documentElement.outerHTML);

    await browser.close();

    return bodyHTML
  }

  getPage().then((body)=>{res.send(body);});
  
});

app.listen(PORT);