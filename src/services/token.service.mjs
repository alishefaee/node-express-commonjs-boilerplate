import httpContext from 'express-http-context'
import { Code } from '../utils/consts.utils.mjs'
import Token from '../models/token.model.mjs'
import { catchAsyncDB } from '../utils/functions.mjs'

class TokenService {
    create = catchAsyncDB(async (resolve, reject, userId, code) => {
        let token = await Token.create({ userId, code })
        resolve(token)
    })

    find = catchAsyncDB(async (resolve, reject, hash) => {
        let token = await Token.findOne({ code: hash })
        resolve(token)
    })

    delete = catchAsyncDB(async (resolve, reject, userId) => {
        let token = await Token.deleteMany({ userId })
        resolve(token)
    })

    findByRefreshToken(rToken) {
        return new Promise(async (resolve, reject) => {
            try {
                let token = await Token.findOne({ rToken })
                resolve(token)
            } catch (e) {
                httpContext.set('status', Code.DATABASE_ERROR)
                reject(e)
            }
        })
    }
}

export default new TokenService()