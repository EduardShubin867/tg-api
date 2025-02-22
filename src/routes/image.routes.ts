import { Router } from 'express'
import { ImageController } from '../controllers/image.controller'
import { upload } from '../middlewares/upload.middleware'

const router = Router()
const imageController = new ImageController()

// Загрузка изображения
router.post('/upload', upload.single('image'), imageController.upload)

// Получение изображения
router.get('/serve/:filename', imageController.serve)

// Трансформация изображения
router.get('/transform/:filename', imageController.transform)

// Удаление изображения
router.delete('/:filename', imageController.delete)

// Получение информации об изображении
router.get('/:filename/info', imageController.getInfo)

export default router
