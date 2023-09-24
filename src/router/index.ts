import express from 'express'
import routerAuth from './auth'
import routerUser from './user'
const router = express.Router()

router.use('/auth', routerAuth)
router.use('/user', routerUser)

export default router
