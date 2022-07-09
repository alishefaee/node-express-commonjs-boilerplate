import { catchAsync, setCodeResponse } from '../../utils/functions.js'
import Login from '../../services/login.service.js'
import User from '../../services/user.service.js'
import { generateHash } from '../../utils/encrypt.utils.js'
import Controller from '../controller.js'
import { Code, UserType } from '../../utils/consts.utils.js'

class Auth extends Controller {
    isAdmin = catchAsync(async (req, res, next) => {
        let user = await Auth.findLoggedIn(req, res)
        if (!user) {
            setCodeResponse(Code.USER_NOT_FOUND)
            return this.response(res)
        }
        if (user.role !== UserType.ADMIN) {
            setCodeResponse(Code.USER_NOT_ADMIN)
            return this.response(res)
        }
        req.user = user
        myConsole('this is admin', user)()
        next()
    })
    isUser = catchAsync(async (req, res, next) => {
        let user = await Auth.findLoggedIn(req, res)
        if (!user) {
            setCodeResponse(Code.USER_NOT_FOUND)
            return this.response(res)
        }
        if (user.role !== UserType.USER) {
            setCodeResponse(Code.USER_NOT_ADMIN)
            return this.response(res)
        }
        req.user = user
        next()
    })
    isLoggedIn = catchAsync(async (req, res, next) => {
        let user = await Auth.findLoggedIn(req, res)
        if (!user) {
            setCodeResponse(Code.USER_NOT_FOUND)
            return this.response(res)
        }

        req.user = user
        next()
    })

    constructor() {
        super()
        this.self = this
    }

    static async findLoggedIn(req, res) {
        let aToken = req.get('aToken')
        if (!aToken) {
            setCodeResponse(Code.ACCESS_TOKEN_NOT_SET)
            return null
        }
        let aHash = generateHash(aToken)
        let login = await Login.findByAccessToken(aHash)
        if (!login) {
            setCodeResponse(Code.ACCESS_TOKEN_INVALID)
            return null
        }
        let timeDistance =
            login.updatedAt.getTime() + Number(process.env.A_TOKEN_PERIOD) - Date.now()
        if (login.aToken === aHash && timeDistance > 0) {
            req.loginId = login._id
            return User.findById(login.userId)
        } else {
            if (login.oldAToken === aHash && timeDistance > 0 && timeDistance < 10000) {
                req.loginId = login._id
                return User.findById(login.userId)
            }
            let rToken = req.get('rToken')
            if (!rToken) {
                setCodeResponse(Code.REFRESH_TOKEN_NOT_SET)
                return null
            }
            let rHash = generateHash(rToken)

            if (login.rToken === rHash) {
                myConsole('rHash found')()
                let timeDistanceRefreshToken =
                    login.updatedAt.getTime() + Number(process.env.R_TOKEN_PERIOD) - Date.now()
                if (timeDistanceRefreshToken > 0) {
                    await Login.updateValidation(Login._id)
                    myConsole('rHash valid')()
                    let updatedLogin = await Login.update(login._id, login.rToken)
                    res.header('aToken', updatedLogin.aToken)
                    res.header('rToken', updatedLogin.rToken)
                    res.header('sessionIsUpdated', true)
                } else {
                    setCodeResponse(Code.REFRESH_TOKEN_EXPIRED)
                    return null
                }
                req.loginId = login._id
                return User.findById(login.userId)
            } else {
                await Login.updateValidation(Login._id)
                setCodeResponse(Code.REFRESH_TOKEN_INVALID)
                return null
            }
        }
    }
}

export default new Auth()
