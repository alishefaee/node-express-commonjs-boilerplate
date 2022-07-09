import { catchAsync, setCodeResponse } from '../utils/functions.js'
import {
    validateApp,
    validateEditUser,
    validateUserByGoogle,
    validateUserByPass
} from './validators/user.validator.js'
import { Code, RegisterType, UserType } from '../utils/consts.utils.js'
import { generateToken, generateHash, generateCode } from '../utils/encrypt.utils.js'
import Controller from './controller.js'
import httpContext from 'express-http-context'
import Email from '../utils/email.js'
import UserService from '../services/user.service.js'
import TokenService from '../services/token.service.js'
import LoginService from '../services/login.service.js'

class User extends Controller {
    signup = catchAsync(async (req, res) => {
        //validation
        let appDataValidationPromise = validateApp(req.body)
        let userValidationPromise = validateUserByPass(req.body)
        let [appDataValidation, userValidation] = await Promise.all([
            appDataValidationPromise,
            userValidationPromise
        ])
        if (appDataValidation !== true || userValidation !== true) {
            setCodeResponse(Code.DATA_NOT_FOUND)
            return this.self.response(res, {}, { ...appDataValidation, ...userValidation })
        }

        let user = await UserService.create({
            ...req.body.user,
            role: UserType.USER,
            type: RegisterType.BUILTIN
        })
        myConsole('after create')()
        myConsole(user)()
        let login = await LoginService.create(user, req.body.app)

        const cleanedData = {
            login: {
                id: login._id,
                createdDate: login.createdAt,
                aToken: login.aToken,
                rToken: login.rToken
            },
            user: {
                id: user._id,
                email: user.email,
                createdDate: user.createdAt
            }
        }

        this.response(res, cleanedData, {})
    })
    loginOrRegister = catchAsync(async (req, res) => {
        //validation
        if (!req.body.user.type) {
            httpContext.set('status', Code.INPUT_DATA_INVALID)
            return this.response(res, { type: 'فیلد تایپ تعریف نشده است' })
        }

        let userValidationPromise
        if (req.body.user.type === 1) {
            userValidationPromise = validateUserByPass(req.body)
        }
        if (req.body.user.type === 2) {
            userValidationPromise = validateUserByGoogle(req.body)
        }
        let appDataValidationPromise = validateApp(req.body)
        let [appDataValidation, userValidation] = await Promise.all([
            appDataValidationPromise,
            userValidationPromise
        ])
        if (appDataValidation !== true || userValidation !== true) {
            httpContext.set('status', Code.DATA_NOT_FOUND)
            return this.self.response(res, {}, { ...appDataValidation, ...userValidation })
        }

        let user = await UserService.find(req.body.user)
        myConsole('after create')()
        myConsole(user)()
        let login = await LoginService.create(user, req.body.app)

        const cleanedData = {
            login: {
                id: login._id,
                createdDate: login.createdAt,
                aToken: login.aToken,
                rToken: login.rToken
            },
            user: {
                id: user._id,
                email: user.email,
                createdDate: user.createdAt
            }
        }
        return this.response(res, cleanedData, {})
    }).bind(Object.constructor(User))
    requestEdit = catchAsync(async (req, res) => {
        let user = req.user
        let code = generateCode()
        await TokenService.create(user._id, code)

        let emailResult = await Email.send({
            to: user.email,
            subject: 'یومی - فراموشی رمز عبور',
            data: { code },
            text: code.toString(),
            templateFile: 'email-reset-pass'
        })

        return this.response(res, {}, { emailResult })
    })
    edit = catchAsync(async (req, res) => {
        let bodyValidation = await validateEditUser(req.body)
        if (bodyValidation !== true) {
            setCodeResponse(Code.DATA_NOT_FOUND)
            return this.response(res, {}, { ...bodyValidation })
        }

        let hash = generateHash(req.body.code)
        let code = await TokenService.find(hash)
        if (code.createdAt.getTime() + Number(process.env.CODE_PERIOD) < Date.now()) {
            setCodeResponse(Code.TOKEN_EXPIRED)
            return this.response(res, {}, {})
        }
        let user = await UserService.updateEmailPass(code.userId, req.body.password, req.body.email)
        if (!user) {
            setCodeResponse(Code.USER_NOT_FOUND)
            return this.response(res, {}, {})
        }
        await LoginService.deleteOtherSessions(user._id, req.loginId)
        await TokenService.delete(user._id)

        const cleanData = {
            user: {
                id: user._id,
                email: user.email,
                createdDate: user.createdAt
            }
        }

        return this.response(res, cleanData, {})
    })
    logout = catchAsync(async (req, res) => {
        await LoginService.deleteSession(req.loginId)
        return this.response(res, {}, {})
    })
    test = catchAsync(async (req, res) => {})

    constructor() {
        super()
        this.self = this
    }
}

export default new User()
