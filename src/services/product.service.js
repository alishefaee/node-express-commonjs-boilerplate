import httpContext from 'express-http-context'
import { Code } from '../utils/consts.utils.js'
import Token from '../models/token.model.mjs'
import { catchAsyncDB } from '../utils/functions.js'

class ProductService {
    findAll = catchAsyncDB(async (resolve, reject, reqBody) => {
        let query = {}
        let pagination = {}
        let sort = {}
        if (reqBody.page) pagination.page = reqBody.page
        if (reqBody.limit) pagination.limit = reqBody.limit
        if (reqBody.order) sort[reqBody.order] = reqBody.sort || -1
        else sort = { createdAt: -1 }

        resolve()
    })
}

export default new ProductService()
