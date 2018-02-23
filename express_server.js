// ================================================================
// MODULE IMPORTS AND GLOBAL VARIABLE DECLARATIONS
// ================================================================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");  //app.set vs app.use??
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'dev']
}));

const urlDatabase = {
  "userRandomID": {
    "b2xVn2": {
      longUrl: "http://www.lighthouselabs.ca",
    },
    "9sm5xK": {
      longUrl: "http://www.google.com",
    }
  },

  "user2RandomID": {
    "4g8Dr2": {
      longUrl: "http://www.nationalgeographic.com",
    },
    "5yT2W9": {
      longUrl: "http://www.economist.com",
    }
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$cXT5hRtAOdvit8AY70M1Y.VAIFh/yisYyNoOglHebZTY9yBy4qEvK"
    //password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$cQNCyw/YZCKRHsCnHENYLu1o7FOktJg6QsLGtxGyCQ4uyoZpq3jqG"
    //password: "dishwasher-funk"
  }
};

//let templateVars = {
//  urlDatabase: urlDatabase,
//  username: null
//};

//console.log('templateVars:', templateVars);
console.log('urlDatabase.userRandomID: ', urlDatabase.userRandomID);
console.log('urlDatabase.user2RandomID: ', urlDatabase.user2RandomID);
console.log('users:', users);

// ================================================================
// FUNCTION DECLARATIONS
// ================================================================

function doesUserEmailExist(email) {
  for (let user in users) {
    //console.log('users[user]["email"]: ', users[user]['email']);
    if (users[user]['email'] === email) {
    //console.log('doesUserEmailExist: ', email);
    return true;
    }
  }
  false;
}

//function isUserPasswordValid(password) {
//  for (let user in users) {
//    console.log('users[user]["password"]: ', users[user]['password']);
//    if (users[user]['password'] === password) {
//    console.log('isUserPasswordValid: ', password);
//    return true;
//    }
//  }
//  false;
//}

const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
};


function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randomString;
}

// ================================================================
// ROUTE HANDLING
// ================================================================

app.get("/", (req, res) => {
  let userId = req.session.userId;
  if (userChecker(req.session.userId)) {
    res.redirect('urls_index');
  } else {
    res.redirect('login');
  }
});

app.get("/register", (req, res) => {
  let userId = req.session.userId;
  let errorCode = req.session.errorCode;
  let userObject = {
    id: null,
    email: null,
    password: null
  };
  if (doesUserEmailExist(req.session.userId)) {
    userObject = users[userId];
    let templateVars = {urls: urlDatabase[userId], user: userObject};
    res.redirect("login");
  }
  res.render("register");
});

app.post("/register", (req, res) => {
  console.log("Post parameters ", req.body);
  if ((req.body.email === '') || (req.body.password === ''))
    return res.status(400).send("Please enter a valid email and/or password");
  else if (doesUserEmailExist(req.body.email) === false)
    return res.status(400).send("User already exists!");
  else {
    let newUserKey = generateRandomString();
    console.log('newUserKey: ', newUserKey);
    users[newUserKey] = {
      id: newUserKey,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
    console.log('user[newUserKey] is: ', users[newUserKey]);
    console.log('new users object is now: ', users);
    console.log('new user password: ', users[newUserKey]['password']);
    res.cookie('userId', newUserKey);
    req.session['userId'] = newUserKey;
    console.log("users: ", users);
    urlDatabase[newUserKey] = {};
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let userId = req.session.userId
  let userObject = {
    id: null,
    email: null,
    password: null
  };
  const templateVars = {urls: urlDatabase[userId], user: userObject};

  if (userId in users) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  // email-password checker
  for (user in users) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.userId = users[user].id;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('Username and/or Password do not match. Please try <a href="/"> again </a>');
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect("/login");
});

//Reads URL database
app.get("/urls", (req, res) => {
  console.log('req.session.userId: ', req.session.userId);
  const userId = req.session.userId;
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    console.log('userId: ', userId);
    const user = users[userId];
    console.log('urlDatabase[user]: ', urlDatabase[userId]);
    let templateVars = {
      urls: urlDatabase[userId],
      user: users[userId]
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Error 401: You are not authorized, Please <a href="/"> Login </a>');
  }
});

//Reads new URL submission page
app.get("/urls/new", (req, res) => {
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    let templateVars = {
      urls: urlDatabase[userId],
      user: users[userId]
    }
    res.render("urls_new", templateVars);
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/login"> Login </a>');
  }
});

//Reads new URL page
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    let templateVars = {
      urls: urlDatabase[userId],
      user: users[userId],
      shortUrl: req.params.id,
      longUrl: urlDatabase[userId][req.params.id]
    };
    res.render("urls_show", templateVars);
  } else {
    //if not logged in, redirect to login page
    res.redirect("/login");
  }
});

//posts new URL to urlDatabase and redirects to /urls/"shortUrl"
app.post("/urls", (req, res) => {
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    console.log("Post parameters", req.body.longUrl);  // debug statement to see POST parameters
    const longUrl = req.body.longUrl;
    console.log("URLS Long URL is ", req.body.longUrl);
    let shortUrl = generateRandomString();
    console.log("URLS Short URL is ", shortUrl);
    urlDatabase[userId][shortUrl] = {longUrl: longUrl};
    console.log("URLS updated URL Database?", urlDatabase[userId]);
    res.redirect(`/urls/${shortUrl}`);
  }
});

//"Posts" deletion of short URL and log URL
app.post("/urls/:id/delete", (req, res) => {
  console.log('req.session.userId: ', req.session.userId);
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    console.log("req.params:", req.params);
    console.log("urlDatabase[userId][req.params.id] to be deleted:", urlDatabase[userId][req.params.id]);
    delete urlDatabase[userId][req.params.id];
    console.log("urlDatabase:", urlDatabase);
    res.redirect("/urls");
  }
});

//changes long URL based on user input (but short URL stays the same)
app.post("/urls/:id", (req, res) => {
  console.log('req.session.userId: ', req.session.userId);
  if (userChecker(req.session.userId)) {
    let updatedLongUrl = "";
    const userId = req.session.userId;
    const longUrl = urlDatabase[userId][req.params.id];
    console.log("changing the long URL for this req.params:", req.params.id);
    console.log("urlDatabase[req.params.id] to be changed:", urlDatabase[userId][req.params.id]);
    updatedLongUrl = req.body.longUrl;
    console.log("updatedLongUrl: ", updatedLongUrl);
    urlDatabase[userId][req.params.id] = {longUrl: updatedLongUrl};
    console.log("urlDatabase[userId]:", urlDatabase[userId]);
    res.redirect("/urls");
  }
});

//redirects client to longUrl
app.get("/u/:shortUrl", (req, res) => {

  //console.log(urlDatabase.userId);
  for (key in urlDatabase) {
    //shortUrl = urlDatabase[key];
    for (shortUrl in urlDatabase[key]) {
      console.log('ShortUrl: ', shortUrl);
      if (shortUrl == req.params.shortUrl) {
        console.log('req.params.shortUrl: ', req.params.shortUrl)
        longUrl = urlDatabase[key][req.params.shortUrl]['longUrl'];
      }
    }
  }
  res.redirect(longUrl);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});