const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4g8Dr2": "http://www.nationalgeographic.com",
  "5yT2W9": "http://www.economist.com"
};

function generateRandomString() {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randomString;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {urlDatabase}); //why curly brackets around urlDatabase? undefined in urls_index otherwise
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let currentUrl = { shortUrl: req.params.id, longUrl: urlDatabase[req.params.id] };
  res.render("urls_show", currentUrl);
});

app.post("/urls", (req, res) => {
  console.log("Post parameters", req.body);  // debug statement to see POST parameters
  let longUrl = req.body.longUrl;
  console.log("Long URL is ", longUrl);
  let shortUrl = generateRandomString();
  console.log("Short URL is ", shortUrl);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  urlDatabase[shortUrl] = req.body.longUrl;
  console.log("updated URL Database?", urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/u/:shortUrl", (req, res) => {
  let longUrl = urlDatabase[req.params.shortUrl];
  res.redirect(longUrl);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});