const httpContext = require("express-http-context");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("./utils/logger.utils.js");
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const { response, setCodeResponse } = require("./utils/functions.js");
const { Code } = require("./utils/consts.utils.js");
const indexRouter = require("./routes/index.router.js");

const app = express();

const { CustomConsole } = require("./utils/functions.js");

global.myConsole = CustomConsole;

//access req.ip
app.set("trust proxy", true);
// view engine setup
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Use any third party middleware that does not need access to the context here, e.g.
app.use(httpContext.middleware);
// all code from here on has access to the same context for each request

// Set security HTTP headers
app.use(helmet());
// Limit requests from same API
const limiter = rateLimit({
  max: 500,
  windowMs: 15 * 60 * 1000, //15 minute
  handler: function (req, res) {
    httpContext.set("status", Code.TOO_MANY_REQUEST);
    return response(res, {}, "حداکثر ۵۰۰ درخواست مجاز");
  },
});
app.use("/", limiter);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(hpp());

app.use("/v3", indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   setCodeResponse(Code.ROUTE_NOT_FOUND)
//   console.log('SSSS')
//   return response(res,{},{})
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   console.log("errr")
//   console.log(err)
//   logger.error({req,err})
//   response(res,{},`${err} ${err.stack}`)
// });

module.exports = app;
