var app = require("express")();
const PORT = process.env.PORT;
var bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/rendered_page", async function(req, res) {
  var pageURL = req.body.url;

  // configure Puppeteer
  let browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process"
    ]
  });

  let page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", req => {
    const whitelist = ["document", "script", "xhr", "fetch"];
    if (!whitelist.includes(req.resourceType())) {
      return request.abort();
    }
    request.continue();
  });

  await page.goto(pageURL, { waitUntil: "domcontentLoaded" });

  const theDOM = await page.evaluate(() => document.documentElement.outerHTML);

  res.send(theDOM);

  await browser.close();
});

app.listen(PORT);
