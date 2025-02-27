import multer from 'multer'
import { Request } from 'express'
import path from 'path'
import fs from 'fs'
import { config } from '../config'

// Создаем директорию для загрузки, если она не существует
if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req: Request, _file: Express.Multer.File, cb) => {
        // Получаем подпапку из параметров запроса или тела
        const subfolder = req.body.subfolder || ''
        const uploadPath = path.join(config.uploadDir, subfolder)

        // Создаем подпапку, если она не существует
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, uploadPath)
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(
            null,
            file.fieldname +
                '-' +
                uniqueSuffix +
                path.extname(file.originalname)
        )
    },
})

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (config.allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Неподдерживаемый тип файла'))
    }
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.maxFileSize,
    },
})
