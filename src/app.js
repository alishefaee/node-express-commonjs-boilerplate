import httpContext from 'express-http-context'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import logger from './utils/logger.utils.js'
import xss from 'xss-clean'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import { response, setCodeResponse } from './utils/functions.js'
import { Code } from './utils/consts.utils.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import swaggerUI from 'swagger-ui-express'
// import basicAuth from 'express-basic-auth'
import indexRouter from './routes/index.router.js'

import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const swaggerJSDocs = require('./docs.json')

const app = express()

// const options = {
//   swaggerOptions: {
//     persistAuthorization: true,
//   }
// }

// app.use("/docs", basicAuth({ users: { 'shafa': '4545' }, challenge: true, }), swaggerUI.serve, (...args) => swaggerUI.setup(swaggerJSDocs, options)(...args));
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSDocs))

import { CustomConsole } from './utils/functions.js'

global.myConsole = CustomConsole

//access req.ip
app.set('trust proxy', true)
// view engine setup
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Use any third party middleware that does not need access to the context here, e.g.
app.use(httpContext.middleware)
// all code from here on has access to the same context for each request

// Set security HTTP headers
app.use(helmet())
// Limit requests from same API
const limiter = rateLimit({
    max: 500,
    windowMs: 15 * 60 * 1000, //15 minute
    handler: function (req, res) {
        httpContext.set('status', Code.TOO_MANY_REQUEST)
        return response(res, {}, 'حداکثر ۵۰۰ درخواست مجاز')
    }
})
app.use('/', limiter)
// Data sanitization against NoSQL query injection
app.use(mongoSanitize())
// Data sanitization against XSS
app.use(xss())
// Prevent parameter pollution
app.use(hpp())

app.use('/v3', indexRouter)

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

export default app
