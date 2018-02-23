// ================================================================
// MODULE IMPORTS AND GLOBAL VARIABLE DECLARATIONS
// ================================================================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'dev'],
  maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
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

console.log('urlDatabase.userRandomID: ', urlDatabase.userRandomID);
console.log('urlDatabase.user2RandomID: ', urlDatabase.user2RandomID);
console.log('users:', users);

// ================================================================
// FUNCTION DECLARATIONS
// ================================================================

function doesUserEmailExist(email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
    return true;
    }
  }
  false;
}

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
    res.cookie('userId', newUserKey);
    req.session['userId'] = newUserKey;
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
  const userId = req.session.userId;
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    const user = users[userId];
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
    res.redirect("/login");
  }
});

//posts new URL to urlDatabase and redirects to /urls/"shortUrl"
app.post("/urls", (req, res) => {
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    const longUrl = req.body.longUrl;
    let shortUrl = generateRandomString();
    urlDatabase[userId][shortUrl] = {longUrl: longUrl};
    res.redirect(`/urls/${shortUrl}`);
  } else res.redirect("/login");
});

//"Posts" deletion of short URL and log URL
app.post("/urls/:id/delete", (req, res) => {
  if (userChecker(req.session.userId)) {
    const userId = req.session.userId;
    delete urlDatabase[userId][req.params.id];
    res.redirect("/urls");
  } else res.redirect("login");
});

//changes long URL based on user input (but short URL stays the same)
app.post("/urls/:id", (req, res) => {
  if (userChecker(req.session.userId)) {
    let updatedLongUrl = "";
    const userId = req.session.userId;
    const longUrl = urlDatabase[userId][req.params.id];
    updatedLongUrl = req.body.longUrl;
    urlDatabase[userId][req.params.id] = {longUrl: updatedLongUrl};
    res.redirect("/urls");
  } else res.redirect("login");
});

//redirects client to longUrl
app.get("/u/:shortUrl", (req, res) => {
  if (userChecker(req.session.userId)) {
    for (key in urlDatabase) {
      for (shortUrl in urlDatabase[key]) {
        if (shortUrl == req.params.shortUrl) {
          longUrl = urlDatabase[key][req.params.shortUrl]['longUrl'];
        }
      }
    }
    res.redirect(longUrl);
  } else res.redirect("login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});