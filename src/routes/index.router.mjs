import express from 'express'
import Controller from '../controllers/controller.mjs'
import userRouter from './user.router.mjs'
import forgotPasswordRouter from './forgot-password.router.mjs'
import productRouter from './product.router.mjs'
import cors from 'cors'
import { response, setCodeResponse } from '../utils/functions.mjs'
import { Code } from '../utils/consts.utils.mjs'
import categoryRouter from './card-category.router.mjs'

const router = express.Router()

router.use(cors())
router.use(new Controller().log)

router.use('/users', userRouter)
router.use('/forgot-passwords', forgotPasswordRouter)
router.use('/products', productRouter)
router.use('/categories/postcards', categoryRouter)

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' })
})

router.get('/*', function (req, res, next) {
    setCodeResponse(Code.ROUTE_NOT_FOUND)
    return response(res, {}, {})
})

export default router
