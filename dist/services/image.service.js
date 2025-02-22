"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const config_1 = require("../config");
class ImageService {
    async processImage(filename, format = 'webp', size) {
        const inputPath = path_1.default.join(config_1.config.uploadDir, filename);
        const image = (0, sharp_1.default)(inputPath);
        // Получаем информацию об изображении
        const metadata = await image.metadata();
        // Применяем размер если указан
        if (size && config_1.config.imageOptions.sizes[size]) {
            const { width, height } = config_1.config.imageOptions.sizes[size];
            image.resize(width, height, {
                fit: 'cover',
                position: 'center',
            });
        }
        // Всегда конвертируем в WebP с оптимальными настройками
        image.webp({
            quality: config_1.config.imageOptions.quality,
            effort: 6, // Максимальное сжатие
            lossless: false, // Используем сжатие с потерями для лучшего размера
        });
        // Изменяем имя файла на .webp
        const outputFilename = `${path_1.default.parse(filename).name}_${size || 'original'}.webp`;
        const outputPath = path_1.default.join(config_1.config.uploadDir, outputFilename);
        // Удаляем оригинальный файл после конвертации
        await image.toFile(outputPath);
        await promises_1.default.unlink(inputPath).catch(() => { }); // Игнорируем ошибки при удалении
        return {
            filename: outputFilename,
            format: 'webp',
            size: size || 'original',
            width: metadata.width,
            height: metadata.height,
        };
    }
    async deleteImage(filename) {
        const filepath = path_1.default.join(config_1.config.uploadDir, filename);
        await promises_1.default.unlink(filepath);
        // Также удаляем все кэшированные версии
        const basename = path_1.default.parse(filename).name;
        const cacheDir = path_1.default.join(config_1.config.uploadDir, 'cache');
        try {
            const cacheFiles = await promises_1.default.readdir(cacheDir);
            await Promise.all(cacheFiles
                .filter((file) => file.startsWith(basename))
                .map((file) => promises_1.default.unlink(path_1.default.join(cacheDir, file))));
        }
        catch (error) {
            // Игнорируем ошибки при очистке кэша
        }
    }
    async getImageInfo(filename) {
        const filepath = path_1.default.join(config_1.config.uploadDir, filename);
        const metadata = await (0, sharp_1.default)(filepath).metadata();
        const stats = await promises_1.default.stat(filepath);
        return {
            filename,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
        };
    }
    async getImage(filename, format, size) {
        const inputPath = path_1.default.join(config_1.config.uploadDir, filename);
        // Проверяем существование файла
        try {
            await promises_1.default.access(inputPath);
        }
        catch {
            throw new Error('Файл не найден');
        }
        // Формируем кэш-ключ (всегда используем webp)
        const cacheKey = `${path_1.default.parse(filename).name}_${size || 'original'}.webp`;
        const cachePath = path_1.default.join(config_1.config.uploadDir, 'cache', cacheKey);
        // Проверяем наличие в кэше
        try {
            await promises_1.default.access(cachePath);
            return {
                path: cachePath,
                filename: cacheKey,
            };
        }
        catch {
            // Если нет в кэше, создаем
            const image = (0, sharp_1.default)(inputPath);
            // Применяем трансформации
            if (size && config_1.config.imageOptions.sizes[size]) {
                const { width, height } = config_1.config.imageOptions.sizes[size];
                image.resize(width, height, {
                    fit: 'cover',
                    position: 'center',
                });
            }
            // Всегда конвертируем в WebP
            image.webp({
                quality: config_1.config.imageOptions.quality,
                effort: 6,
                lossless: false,
            });
            // Создаем директорию кэша если не существует
            await promises_1.default.mkdir(path_1.default.join(config_1.config.uploadDir, 'cache'), {
                recursive: true,
            });
            // Сохраняем в кэш
            await image.toFile(cachePath);
            return {
                path: cachePath,
                filename: cacheKey,
            };
        }
    }
}
exports.ImageService = ImageService;
