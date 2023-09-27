import fs from 'fs'
import path from 'path'
import multer from 'multer'
// const multer = require('multer')

const storageFile = (folder = 'temp') => {
  const storage = multer.diskStorage({
    destination: function (req: any, file, cb) {
      const pathDir = path.join(req?.getDirRoot(), `${folder}`)
      checkPathCreateFolder(pathDir)
      cb(null, pathDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`)
    }
  })

  return storage
}

const imageFilter = function (req: any, file: any, cb: any) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!'
    return cb(null, false)
  }

  cb(null, true)
}

const uploadFile = ({
  name,
  isMutile = false,
  pathRoot = 'temp',
  countFile = 2,
  validateFilterFile = imageFilter
}: uploadFileType) => {
  const fileUpload = multer({
    storage: storageFile(pathRoot),
    fileFilter: validateFilterFile
  })
  let upload = null
  let uploadFucMiddleware = null

  if (isMutile) {
    uploadFucMiddleware = fileUpload.array(name, countFile)
    upload = multer().array(name)
  } else {
    uploadFucMiddleware = fileUpload.single(name)
    upload = multer().single(name)
  }
  return {
    uploadFucMiddleware,
    upload
  }
}

const unlinkFile = async (pathFile: string) => {
  let isChecking = false

  if (fs.existsSync(pathFile)) {
    fs.unlinkSync(pathFile)
    isChecking = true
  } else {
    isChecking = false
  }

  return isChecking
}

const checkPathCreateFolder = (path: string) => {
  let error = false
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
    error = true
  }

  return error
}

const copyFile = (path: string, pathCopy: string) => {
  let err = false
  try {
    fs.copyFileSync(path, pathCopy)
    unlinkFile(path)
  } catch {
    err = false
  }

  return err
}

export { storageFile, uploadFile, unlinkFile, checkPathCreateFolder, copyFile }
