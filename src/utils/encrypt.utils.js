import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import httpContext from 'express-http-context'
import { Code } from './consts.utils.js'

export const passwordHash = async (pass) => {
    const saltRounds = 10
    return await bcrypt.hash(pass, saltRounds)
}

export const passwordVerify = (pass, hash) => {
    return new Promise(async (resolve, reject) => {
        hash = hash.replace('$2y$', '$2a$')
        const match = await bcrypt.compare(pass, hash)
        console.log(match)
        if (match) resolve()
        else {
            console.log('LKJ')
            httpContext.set('status', Code.AUTHENTICATION_FAILED)
            reject()
        }
    })
}

export const generateCode = () => {
    // generate 6 digits number
    return Math.floor(100000 + Math.random() * 900000)
}

export const generateToken = () => {
    return crypto.randomBytes(64).toString('hex')
}

export const generateHash = (token) => {
    return crypto
        .createHmac('sha256', process.env.JWTSECRET)
        .update(token.toString())
        .digest('base64')
}

export const generateId = (type) => {
    let id = crypto.randomBytes(12).toString('hex')
    id = type === 'o' ? parseInt(id, 10) : id
    return type + '-' + id
}
