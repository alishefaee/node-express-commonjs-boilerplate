import express from 'express'
import user from '../controllers/user.controller.mjs'
import auth from '../controllers/middlewares/auth.middleware.mjs'

const router = express.Router()

router.get('/test', auth.isAdmin, user.test)

export default router
