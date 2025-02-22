import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { config } from '../config'

export class ImageService {
    private getFullPath(filename: string): string {
        // Обрабатываем пути с подпапками
        return path.join(config.uploadDir, filename)
    }

    private getCachePath(filename: string, size?: string): string {
        const { dir, name } = path.parse(filename)
        const cacheDir = path.join(config.uploadDir, 'cache', dir)
        const cacheKey = `${name}_${size || 'original'}.webp`
        return path.join(cacheDir, cacheKey)
    }

    async processImage(
        filename: string,
        format: 'jpeg' | 'webp' | 'png' = 'webp',
        size?: keyof typeof config.imageOptions.sizes
    ) {
        const inputPath = this.getFullPath(filename)
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

        // Сохраняем в кэш с сохранением структуры подпапок
        const cachePath = this.getCachePath(filename, size)
        await fs.mkdir(path.dirname(cachePath), { recursive: true })
        await image.toFile(cachePath)

        // Удаляем оригинальный файл после конвертации
        await fs.unlink(inputPath).catch(() => {}) // Игнорируем ошибки при удалении

        return {
            filename,
            format: 'webp',
            size: size || 'original',
            width: metadata.width,
            height: metadata.height,
        }
    }

    async deleteImage(filename: string) {
        const filepath = this.getFullPath(filename)
        await fs.unlink(filepath)

        // Удаляем все кэшированные версии
        const cachePath = this.getCachePath(filename)
        const cacheDir = path.dirname(cachePath)
        try {
            const cacheFiles = await fs.readdir(cacheDir)
            const { name } = path.parse(filename)
            await Promise.all(
                cacheFiles
                    .filter((file) => file.startsWith(name))
                    .map((file) => fs.unlink(path.join(cacheDir, file)))
            )
        } catch (error) {
            // Игнорируем ошибки при очистке кэша
        }
    }

    async getImageInfo(filename: string) {
        const filepath = this.getFullPath(filename)
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
        const inputPath = this.getFullPath(filename)

        // Проверяем существование файла
        try {
            await fs.access(inputPath)
        } catch {
            throw new Error('Файл не найден')
        }

        // Получаем путь в кэше
        const cachePath = this.getCachePath(filename, size)

        // Проверяем наличие в кэше
        try {
            await fs.access(cachePath)
            return {
                path: cachePath,
                filename: path.basename(cachePath),
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
            await fs.mkdir(path.dirname(cachePath), { recursive: true })

            // Сохраняем в кэш
            await image.toFile(cachePath)

            return {
                path: cachePath,
                filename: path.basename(cachePath),
            }
        }
    }
}
