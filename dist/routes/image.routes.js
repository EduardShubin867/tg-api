"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const image_controller_1 = require("../controllers/image.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
const imageController = new image_controller_1.ImageController();
// Загрузка изображения
router.post('/upload', upload_middleware_1.upload.single('image'), imageController.upload);
// Получение изображения
router.get('/serve/:filename', imageController.serve);
// Трансформация изображения
router.get('/transform/:filename', imageController.transform);
// Удаление изображения
router.delete('/:filename', imageController.delete);
// Получение информации об изображении
router.get('/:filename/info', imageController.getInfo);
exports.default = router;
