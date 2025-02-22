"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const image_service_1 = require("../services/image.service");
const config_1 = require("../config");
const path_1 = __importDefault(require("path"));
class ImageController {
    constructor() {
        this.upload = async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'Файл не загружен' });
                }
                const result = await this.imageService.processImage(req.file.filename);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при обработке изображения' });
            }
        };
        this.transform = async (req, res) => {
            try {
                const { filename } = req.params;
                const { format, size } = req.query;
                if (!filename) {
                    return res.status(400).json({ error: 'Имя файла не указано' });
                }
                const validFormat = format;
                const validSize = size;
                if (format && !config_1.config.imageOptions.formats.includes(validFormat)) {
                    return res
                        .status(400)
                        .json({ error: 'Неподдерживаемый формат' });
                }
                if (size && !config_1.config.imageOptions.sizes[validSize]) {
                    return res
                        .status(400)
                        .json({ error: 'Неподдерживаемый размер' });
                }
                const result = await this.imageService.processImage(filename, validFormat, validSize);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    error: 'Ошибка при трансформации изображения',
                });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { filename } = req.params;
                await this.imageService.deleteImage(filename);
                res.json({ message: 'Изображение успешно удалено' });
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при удалении изображения' });
            }
        };
        this.getInfo = async (req, res) => {
            try {
                const { filename } = req.params;
                const info = await this.imageService.getImageInfo(filename);
                res.json(info);
            }
            catch (error) {
                res.status(500).json({
                    error: 'Ошибка при получении информации об изображении',
                });
            }
        };
        this.serve = async (req, res) => {
            try {
                const { filename } = req.params;
                const { format, size } = req.query;
                if (!filename) {
                    return res.status(400).json({ error: 'Имя файла не указано' });
                }
                const validFormat = format;
                const validSize = size;
                // Проверяем валидность параметров
                if (format && !config_1.config.imageOptions.formats.includes(validFormat)) {
                    return res
                        .status(400)
                        .json({ error: 'Неподдерживаемый формат' });
                }
                if (size && !config_1.config.imageOptions.sizes[validSize]) {
                    return res
                        .status(400)
                        .json({ error: 'Неподдерживаемый размер' });
                }
                const result = await this.imageService.getImage(filename, validFormat, validSize);
                // Устанавливаем заголовки для кэширования
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год
                res.setHeader('Content-Type', `image/${path_1.default.extname(result.filename).slice(1)}`);
                // Отправляем файл
                res.sendFile(result.path);
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Файл не найден') {
                    res.status(404).json({ error: 'Изображение не найдено' });
                }
                else {
                    res.status(500).json({
                        error: 'Ошибка при получении изображения',
                    });
                }
            }
        };
        this.imageService = new image_service_1.ImageService();
    }
}
exports.ImageController = ImageController;
