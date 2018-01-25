const express = require("express");
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

const PORT = process.env.PORT || 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");  //app.set vs app.use??

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4g8Dr2": "http://www.nationalgeographic.com",
  "5yT2W9": "http://www.economist.com"
};

function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randomString;
}



//app.get("/", (req, res) => {
//  res.end("TinyApp!");
//});

app.get("/", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  };
  res.render("main", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  //const username = req.body.username;
  //const password = req.body.password;
  //console.log(username); // password);
  res.cookie('username', req.body.username);
  //console.log('Cookies: ', res.cookie);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/");
});

//Reads URL database
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  };
  //let username = req.cookies.username;
  res.render("urls_index", templateVars); //why curly brackets around urlDatabase? undefined in urls_index otherwise
});

//Reads new URL submission page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id]
  };
  res.render("urls_new", templateVars);
});

//Reads new URL page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//"Posts" deletion of short URL and log URL
app.post("/urls/:id/delete", (req, res) => {
  console.log("req.params:", req.params);
  console.log("urlDatabase[req.params.id] to be deleted:", urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  console.log("urlDatabase:", urlDatabase);
  res.redirect("/urls");
});

//posts new URL to urlDatabase and redirects to /urls/"shortUrl"
app.post("/urls", (req, res) => {
  console.log("Post parameters", req.body);  // debug statement to see POST parameters
  //let longUrl = req.body.longUrl;
  console.log("Long URL is ", req.body.longUrl);
  let shortUrl = generateRandomString();
  console.log("Short URL is ", shortUrl);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  urlDatabase[shortUrl] = req.body.longUrl;
  console.log("updated URL Database?", urlDatabase);
  //console.log(updatedLongUrl);
  res.redirect(`/urls/${shortUrl}`);
});

//changes long URL based on user input (but short URL stays the same)
app.post("/urls/:id", (req, res) => {
  console.log("changing the long URL for this req.params:", req.params);
  console.log("urlDatabase[req.params.id] to be changed:", urlDatabase[req.params.id]);
  console.log("updated longUrl:", req.body.longUrl);
  urlDatabase[req.params.id] = req.body.longUrl;
  console.log("urlDatabase:", urlDatabase);
  res.redirect("/urls");
});

//redirects client to longUrl
app.get("/u/:shortUrl", (req, res) => {
  const longUrl = urlDatabase[req.params.shortUrl];
  res.redirect(longUrl);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});