import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { config } from '../config'

export class ImageService {
    async processImage(
        filename: string,
        format: 'jpeg' | 'webp' | 'png' = 'webp',
        size?: keyof typeof config.imageOptions.sizes
    ) {
        const inputPath = path.join(config.uploadDir, filename)
        const image = sharp(inputPath)

        // Получаем информацию об изображении
        const metadata = await image.metadata()

        // Применяем размер если указан
        if (size && config.imageOptions.sizes[size]) {
            const { width, height } = config.imageOptions.sizes[size]
            image.resize(width, height, {
                fit: 'cover',
                position: 'center',
            })
        }

        // Всегда конвертируем в WebP с оптимальными настройками
        image.webp({
            quality: config.imageOptions.quality,
            effort: 6, // Максимальное сжатие
            lossless: false, // Используем сжатие с потерями для лучшего размера
        })

        // Изменяем имя файла на .webp
        const outputFilename = `${path.parse(filename).name}_${size || 'original'}.webp`
        const outputPath = path.join(config.uploadDir, outputFilename)

        // Удаляем оригинальный файл после конвертации
        await image.toFile(outputPath)
        await fs.unlink(inputPath).catch(() => {}) // Игнорируем ошибки при удалении

        return {
            filename: outputFilename,
            format: 'webp',
            size: size || 'original',
            width: metadata.width,
            height: metadata.height,
        }
    }

    async deleteImage(filename: string) {
        const filepath = path.join(config.uploadDir, filename)
        await fs.unlink(filepath)

        // Также удаляем все кэшированные версии
        const basename = path.parse(filename).name
        const cacheDir = path.join(config.uploadDir, 'cache')
        try {
            const cacheFiles = await fs.readdir(cacheDir)
            await Promise.all(
                cacheFiles
                    .filter((file) => file.startsWith(basename))
                    .map((file) => fs.unlink(path.join(cacheDir, file)))
            )
        } catch (error) {
            // Игнорируем ошибки при очистке кэша
        }
    }

    async getImageInfo(filename: string) {
        const filepath = path.join(config.uploadDir, filename)
        const metadata = await sharp(filepath).metadata()
        const stats = await fs.stat(filepath)
        return {
            filename,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
        }
    }

    async getImage(
        filename: string,
        format?: 'jpeg' | 'webp' | 'png',
        size?: keyof typeof config.imageOptions.sizes
    ) {
        const inputPath = path.join(config.uploadDir, filename)

        // Проверяем существование файла
        try {
            await fs.access(inputPath)
        } catch {
            throw new Error('Файл не найден')
        }

        // Формируем кэш-ключ (всегда используем webp)
        const cacheKey = `${path.parse(filename).name}_${size || 'original'}.webp`
        const cachePath = path.join(config.uploadDir, 'cache', cacheKey)

        // Проверяем наличие в кэше
        try {
            await fs.access(cachePath)
            return {
                path: cachePath,
                filename: cacheKey,
            }
        } catch {
            // Если нет в кэше, создаем
            const image = sharp(inputPath)

            // Применяем трансформации
            if (size && config.imageOptions.sizes[size]) {
                const { width, height } = config.imageOptions.sizes[size]
                image.resize(width, height, {
                    fit: 'cover',
                    position: 'center',
                })
            }

            // Всегда конвертируем в WebP
            image.webp({
                quality: config.imageOptions.quality,
                effort: 6,
                lossless: false,
            })

            // Создаем директорию кэша если не существует
            await fs.mkdir(path.join(config.uploadDir, 'cache'), {
                recursive: true,
            })

            // Сохраняем в кэш
            await image.toFile(cachePath)

            return {
                path: cachePath,
                filename: cacheKey,
            }
        }
    }
}
