import httpContext from 'express-http-context'
import UserModel from '../models/user.model.mjs'
import { Code } from '../utils/consts.utils.mjs'
import { generateId, passwordVerify } from '../utils/encrypt.utils.mjs'
import { catchAsyncDB } from '../utils/functions.mjs'

class User {
    create = catchAsyncDB(async (resolve, reject, data) => {
        let user = await UserModel.create(data)
        resolve(user)
    })

    find = catchAsyncDB(async (resolve, reject, data) => {
        let user = await UserModel.findOne({ email: data.email })
        if (!user) {
            httpContext.set('status', Code.INPUT_DATA_INVALID)
            reject()
        }
        await passwordVerify(data.password, user.password)
        resolve(user)
    })

    findByEmail = catchAsyncDB(async (resolve, reject, email) => {
        let user = await UserModel.findOne({ email })
        resolve(user)
    })

    findById = catchAsyncDB(async (resolve, reject, _id) => {
        let user = await UserModel.findById( _id )
        resolve(user)
    })

    findByResetLink(resetHash) {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await UserModel.findOne({ resetHash })
                resolve(user)
            } catch (e) {
                httpContext.set('status', Code.DATABASE_ERROR)
                reject(e)
            }
        })
    }

    update = catchAsyncDB(async (resolve, reject, _id, password) => {
        let user = await UserModel.findOneAndUpdate(
            { _id },
            { $set: { password } },
        )
        resolve(user)
    })

    updateEmailPass = catchAsyncDB(
        async (resolve, reject, _id, password, email) => {
            let user = await UserModel.findOneAndUpdate(
                { _id },
                { $set: { password, email } },
            )
            resolve(user)
        },
    )
}

export default new User()