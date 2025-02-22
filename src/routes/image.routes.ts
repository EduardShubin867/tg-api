import { Router } from 'express'
import { ImageController } from '../controllers/image.controller'
import { upload } from '../middlewares/upload.middleware'

const router = Router()
const imageController = new ImageController()

// Логирование запросов
router.use((req, res, next) => {
    console.log('Image route:', req.method, req.path, req.params)
    next()
})

// Загрузка изображения
router.post('/upload', upload.single('image'), imageController.upload)

// Получение изображения (поддержка вложенных путей)
router.get('/serve/:path(*)', imageController.serve)

// Трансформация изображения (поддержка вложенных путей)
router.get('/transform/:path(*)', imageController.transform)

// Удаление изображения (поддержка вложенных путей)
router.delete('/:path(*)', imageController.delete)

// Получение информации об изображении (поддержка вложенных путей)
router.get('/:path(*)/info', imageController.getInfo)

export default router
