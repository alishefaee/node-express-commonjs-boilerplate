import express from 'express'
import user from '../controllers/user.controller.mjs'

const router = express.Router()

router.post('/signup', user.signup)

export default router
