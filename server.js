    var express = require("./node_modules/express"),

    //express.js app configuration
        app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 8083);
    app.set('views', __dirname);
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});


    //route handlers 
app.all("*", function (request, response, next) {
    next();
});

app.get("/", function (request, response) {
    response.render('index.jade');
});

app.listen(app.get('port'));
console.log("Express app started on port %d", app.get('port'));
