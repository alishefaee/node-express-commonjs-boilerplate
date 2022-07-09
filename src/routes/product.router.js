import express from 'express'
import user from '../controllers/user.controller.js'
import auth from '../controllers/middlewares/auth.middleware.js'

const router = express.Router()

router.get('/test', auth.isAdmin, user.test)

export default router
