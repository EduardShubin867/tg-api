import { Request, Response } from 'express'
import { ImageService } from '../services/image.service'
import { config } from '../config'
import path from 'path'

export class ImageController {
    private imageService: ImageService

    constructor() {
        this.imageService = new ImageService()
    }

    upload = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Файл не загружен' })
            }

            // Формируем относительный путь с учетом подпапки
            const subfolder = req.body.subfolder || ''
            const relativeFilePath = path.join(subfolder, req.file.filename)

            const result =
                await this.imageService.processImage(relativeFilePath)
            res.json(result)
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при обработке изображения' })
        }
    }

    transform = async (req: Request, res: Response) => {
        try {
            const { filename } = req.params
            const { format, size } = req.query

            if (!filename) {
                return res.status(400).json({ error: 'Имя файла не указано' })
            }

            const validFormat = format as 'jpeg' | 'webp' | 'png'
            const validSize = size as keyof typeof config.imageOptions.sizes

            if (format && !config.imageOptions.formats.includes(validFormat)) {
                return res
                    .status(400)
                    .json({ error: 'Неподдерживаемый формат' })
            }

            if (size && !config.imageOptions.sizes[validSize]) {
                return res
                    .status(400)
                    .json({ error: 'Неподдерживаемый размер' })
            }

            const result = await this.imageService.processImage(
                filename,
                validFormat,
                validSize
            )
            res.json(result)
        } catch (error) {
            res.status(500).json({
                error: 'Ошибка при трансформации изображения',
            })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const { filename } = req.params
            await this.imageService.deleteImage(filename)
            res.json({ message: 'Изображение успешно удалено' })
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при удалении изображения' })
        }
    }

    getInfo = async (req: Request, res: Response) => {
        try {
            const { filename } = req.params
            const info = await this.imageService.getImageInfo(filename)
            res.json(info)
        } catch (error) {
            res.status(500).json({
                error: 'Ошибка при получении информации об изображении',
            })
        }
    }

    serve = async (req: Request, res: Response) => {
        try {
            const { filename } = req.params
            const { format, size } = req.query

            if (!filename) {
                return res.status(400).json({ error: 'Имя файла не указано' })
            }

            const validFormat = format as 'jpeg' | 'webp' | 'png' | undefined
            const validSize = size as
                | keyof typeof config.imageOptions.sizes
                | undefined

            if (format && !config.imageOptions.formats.includes(validFormat!)) {
                return res
                    .status(400)
                    .json({ error: 'Неподдерживаемый формат' })
            }

            if (size && !config.imageOptions.sizes[validSize!]) {
                return res
                    .status(400)
                    .json({ error: 'Неподдерживаемый размер' })
            }

            const result = await this.imageService.getImage(
                filename,
                validFormat,
                validSize
            )

            // Устанавливаем CORS заголовки
            res.setHeader(
                'Access-Control-Allow-Origin',
                'https://eduardshubin867-tarot-miniapp-e31c.twc1.net'
            )
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
            res.setHeader(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            )

            // Устанавливаем заголовки для кэширования
            res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 год
            res.setHeader(
                'Content-Type',
                `image/${path.extname(result.filename).slice(1)}`
            )

            // Отправляем файл
            res.sendFile(result.path)
        } catch (error) {
            if (error instanceof Error && error.message === 'Файл не найден') {
                res.status(404).json({ error: 'Изображение не найдено' })
            } else {
                res.status(500).json({
                    error: 'Ошибка при получении изображения',
                })
            }
        }
    }
}
