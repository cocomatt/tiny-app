/*const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4g8Dr2": "http://www.nationalgeographic.com",
  "5yT2W9": "http://www.economist.com"
};
for (var property in urlDatabase) {
  console.log(`Short URL: ${property} Long URL: ${urlDatabase[property]}`);
}

*/



/*
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randonString;
}

console.log(generateRandomString());

*/



let req.body = { longUrl: 'www.google.ca' }
console.log(req.body[key]);