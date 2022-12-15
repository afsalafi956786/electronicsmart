const createError = require('http-errors');
const express = require('express')
const app = express()
// const hbs=require('hbs')
const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRouter')
require('dotenv').config()
const connectDb = require('./models/connection')

const DATABASE_URL = process.env.DATABASE_URL
connectDb(DATABASE_URL);
const hbs = require('hbs')
const path = require('path')
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const session = require('express-session');
// const error = require('./routes/error')


//view engine setup
app.set('view engine', __dirname + '/views')
app.set('view engine', 'hbs')

const partialPath = path.join(__dirname, 'views/partials')
hbs.registerPartials(partialPath)
const layoutPath = path.join(__dirname, 'views/layout')
hbs.registerPartials(layoutPath)


// cache clear
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
})


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//session handling
app.use(cookieParser());
const oneday = 1000 * 60 * 60 * 24
app.use(session({
  secret: "Key",
  cookie: { maxAge: oneday },
  resave: true,
  saveUninitialized: true
}))

// hbs.registerHelper("prettifyDate", function(timestamp) {
//   return (new Date(timestamp)).format("yyyy-MM-dd");
// });

//set Route
app.use(express.static(__dirname + '/public'));
app.use('/admin', adminRouter)
app.use('/', userRouter)

app.use(function (req, res, next) {
  next(createError(404));
});


// module.exports = app;


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('user/error/error');
});



app.listen(process.env.PORT || 3000)
