'use strict';
const createError = require('http-errors');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
// const cookieParser = require('cookie-parser');
const session = require('express-session')
const logger = require('morgan');
const fs = require('fs')
// load routers
const user_router = require('./routes/user_router');
const parking_station_router = require('./routes/parking_station_router');
const admin_router = require('./routes/admin_router');

const app = express();

// view engine setup
app.engine('hbs', exphbs.engine({defaultLayout: 'main',extname: '.hbs'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(":memory:" , (err) => {
  if(err) { console.log("Error Occurred - " + err.message); }
  else { console.log("DataBase Connected"); }
})

// log
// morgan.token('sessionid', function(req, res, param) {  return req.sessionID;});
// morgan.token('user', function(req, res, param) {  return req.session.user;});
const log_stream = fs.createWriteStream(path.join(__dirname, 'logfile.log'), { flags: 'a' })
// app.use(logger(':date[iso] // :remote-addr // :remote-user // :url // :referrer // :sessionid // :user // :http-version // :status // :method // :response-time ms //', {stream: log_stream}));
app.use(logger(':date[iso] // :remote-addr // :remote-user // :url // :referrer // :http-version // :status // :method // :response-time ms //', {stream: log_stream}));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// session
// app.use(cookieParser());
app.use(session({
  name: 'Parkaro_app_session',
  secret: process.env.secret || "PynOjAuHetAuWawtinAytVunarAcjeBlybEshkEjVudyelwa",
  resave: false,
  saveUninitialized: true,
  cookie: {
      maxAge: 60000 * 60, //1 ώρα
      httpOnly: true,
      sameSite: true,
      // secure: true //Το cookie θα σταλεί μόνο μέσω https. Σε απλό http δε θα λειτουργήσει
  },
  // store: new MemoryStore({ checkPeriod: 86400000 })
}))

// app.use((req, res, next) => { res.locals.userId = req.session.loggedUserId; next(); })

app.use(express.static(path.join(__dirname, 'public')));
// use routers
app.use('/', user_router);
app.use('/parking_station', parking_station_router);
app.use('/admin', admin_router);
// bootstrap
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
// app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
// font-awesome
app.use('/fa', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
