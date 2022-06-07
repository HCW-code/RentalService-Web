var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport')

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  //ejs 사용

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('session-secret-key'));

//정적 파일 설정
app.use(express.static(path.join(__dirname, 'public')));

//데이터 정재 (제대로 데이터를 가져오기 위함)
app.use(bodyParser.urlencoded({extended: true}));


//세션
app.use(session({
  secret: 'session-secret-key', // 데이터를 암호화 하기 위해 필요한 옵션
  resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
  saveUninitialized: false, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new FileStore() // 세션이 데이터를 저장하는 곳
}));


app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

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
