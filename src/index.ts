import { config } from 'dotenv'
config()
import express from 'express'
import helmet from 'helmet'
import path from 'node:path'
import http from 'http'
import { Server } from 'socket.io'
import { responsiveFuc } from './middleware/responsive.middleware'
import { joinUrl } from './common/modelFuc'
import router from './router'

const app = express()
const PORT = process.env.PORT

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
)

app.use(express.static('src/public'))

app.use(function (req, _res, next) {
  req.getUrl = function () {
    const proto = req.headers['x-forwarded-proto'] || req.protocol
    const url = `${proto}://${req.get('host')}`
    return url
  }
  req.getUrlPublic = function (folder = 'images') {
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

io.on('connection', (socket) => {
  console.log(socket.id)
})

server.listen(PORT)
