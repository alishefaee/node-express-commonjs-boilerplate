import Validator from 'fastest-validator'
import types from './consts.validator.mjs'

const v = new Validator({
    useNewCustomCheckerFunction: true, // using new version
    // Register our new error message text
    atLeastOneLetter: 'at least one letter',
    atLeastOneDigit: 'at least one digit',
})

const appSchema = {
    app: {
        type: 'object',
        strict: true,
        props: {
            appv: types.appv,
            apps: types.apps,
            deviceName: types.deviceName,
            deviceId: types.deviceId,
        },
    },
    $$async: true,
}

const emailPassSchema = {
    user: {
        type: 'object',
        props: {
            email: types.email,
            password: types.password,
        },
    },
    $$async: true,
}

const googleSchema = {
    user: {
        type: 'object',
        strict: true,
        props: {
            token: { type: 'string', trim: true, optional: true },
            type: { type: 'enum', values: [1, 2] },
        },
    },
    $$async: true,
}

const requestResetSchema = {
    email: types.email,
    $$async: true,
}

const resetPasswordSchema = {
    code: { type: 'number', length: 6 },
    password: types.password,
    $$async: true,
}

const editUserSchema = {
    code: { type: 'number', length: 6 },
    password: types.password,
    email: types.email,
    $$async: true,
}

export const validateApp = v.compile(appSchema)
export const validateUserByPass = v.compile(emailPassSchema)
export const validateUserByGoogle = v.compile(googleSchema)
export const validateReqReset = v.compile(requestResetSchema)
export const validateResetPassword = v.compile(resetPasswordSchema)
export const validateEditUser = v.compile(editUserSchema)

