import { config } from 'dotenv'
config()
import express from 'express'
import helmet from 'helmet'
import path from 'node:path'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { responsiveFuc } from './middleware/responsive.middleware'
import { joinUrl } from './common/modelFuc'
import router from './router'
import { verifyTokenSocket } from './middleware/tokenMiddleware'

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
      socket.data = result.data
      next()
    }
  }
})

io.on('connection', (socket) => {
  console.log(socket.data)
})

server.listen(PORT)
