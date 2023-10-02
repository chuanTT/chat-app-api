import { config } from 'dotenv'
config()
import express from 'express'
import helmet from 'helmet'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { responsiveFuc } from './middleware/responsive.middleware'
import { joinUrl } from './common/modelFuc'
import router from './router'
import { verifyTokenSocket } from './middleware/tokenMiddleware'
import { TableRoom, TableUser, UpdatedShared, getOneShared } from './model/shared.model'

const app = express()
const PORT = process.env.PORT

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
)

app.use(cors())

app.use(express.static('src/public'))

app.use(function (req, _res, next) {
  req.getUrl = function () {
    const proto = req.headers['x-forwarded-proto'] || req.protocol
    const url = `${proto}://${req.get('host')}`
    return url
  }
  req.getUrlPublic = function (folder = 'avatar') {
    return joinUrl(folder ?? '/', req.getUrl())
  }

  req.getDirRoot = (key = 'public') => {
    let dir = __dirname
    const startIndex = dir.indexOf(key)

    if (startIndex === -1) {
      dir = path.join(dir, key)
    } else {
      dir = dir.substring(0, startIndex + key.length)
    }

    return dir
  }

  return next()
})

app.use(responsiveFuc)

app.use('/api/v1', router)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})
global.socketServer = io

io.use(async (socket, next) => {
  const token = socket.handshake?.auth?.token
  if (token) {
    const result = await verifyTokenSocket(token)
    if (result?.isVerify) {
      if (result?.data?.is_online === 0) {
        const date = new Date()
        await UpdatedShared({
          select: ['is_online', 'last_logger'],
          table: TableUser,
          values: [1, date, result?.data.id],
          where: 'id=?'
        })
      }

      socket.data = result.data
      next()
    }
  }
})

let activeRoom: number | null = null
io.on('connection', (socket) => {
  socket.on('private_room', async (data) => {
    const { id } = socket.data
    const checkRoom = await getOneShared<resultRoom>({
      select: 'id, owner_id, friend_id',
      table: TableRoom,
      where: 'id=?',
      data: [data?.room]
    })

    if (id === checkRoom?.owner_id || id === checkRoom?.friend_id) {
      checkRoom.id && (activeRoom = checkRoom.id)
      socket.join(`room-${checkRoom.id}`)

      socket.on('leave-room', () => {
        socket.leave(`room-${checkRoom.id}`)
      })
    }
  })

  socket.on('disconnect', async () => {
    const user = socket.data as userData
    const select = []
    const values = []

    if (user?.is_online === 1) {
      select.push('is_online')
      values.push(0)
    }

    if (user?.is_busy === 1) {
      select.push('is_busy')
      values.push(0)
    }

    if (select?.length > 0) {
      const date = new Date()
      await UpdatedShared({
        select: [...select, 'last_logger'],
        table: TableUser,
        values: [...values, date, user.id],
        where: 'id=?'
      })
    }

    if (activeRoom) {
      activeRoom = null
      socket.leave(`room-${activeRoom}`)
    }
  })
})

server.listen(PORT)
