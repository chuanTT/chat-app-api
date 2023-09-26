import express from 'express'
import routerAuth from './auth'
import routerInvite from './invite'
import routerUser from './user'

const router = express.Router()

router.use('/auth', routerAuth)
router.use('/invite', routerInvite)
router.use('/user', routerUser)

export default router
