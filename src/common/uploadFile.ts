import fs from 'fs'
import path from 'path'
import multer from 'multer'
// const multer = require('multer')

const storageFile = (folder = 'images') => {
  const storage = multer.diskStorage({
    destination: function (req: any, file, cb) {
      cb(null, path.join(req?.getDirRoot(), `${folder}`))
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
  pathRoot = 'images',
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

const unlinkFile = async (nameFile: string, DIR_ROOT = '', folder = 'images') => {
  let isChecking = false
  const pathRoot = path.join(DIR_ROOT, `${folder}/${nameFile}`)

  if (fs.existsSync(pathRoot)) {
    fs.unlinkSync(pathRoot)
    isChecking = true
  } else {
    isChecking = false
  }

  return isChecking
}

export { storageFile, uploadFile, unlinkFile }
