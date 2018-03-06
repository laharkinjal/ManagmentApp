var express = require("express");
var bodyParser = require("body-parser");
var session = require('express-session');

var app = express();
//app.use(session());

app.use(bodyParser.json());


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('access-control-allow-origin','*')
    next();
    });
    
app.use(bodyParser.urlencoded({ extended: true }));

var routes = require("./routes/routes.js")(app);

app.use('/', express.static(__dirname + '/public/'));
//app.listen(process.env.PORT || 5000);

var port = process.env.PORT || 3030;
app.listen(port, "0.0.0.0", function() {
console.log("Listening on Port 3030");
});

// var server = app.listen(3000, function () {
//     console.log("Listening on port %s...", server.address().port);
// });