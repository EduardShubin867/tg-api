"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const image_routes_1 = __importDefault(require("./routes/image.routes"));
const tarot_routes_1 = __importDefault(require("./routes/tarot.routes"));
const cards_routes_1 = __importDefault(require("./routes/cards.routes"));
const config_1 = require("./config");
const app = (0, express_1.default)();
// Настройка Helmet с CSP
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", 'api.openai.com'],
            fontSrc: ["'self'", 'cdnjs.cloudflare.com'],
        },
    },
}));
// Настройка CORS
app.use((0, cors_1.default)({
    origin: [
        'https://eduardshubin867-tarot-miniapp-e31c.twc1.net',
        'http://localhost:5173',
        'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express_1.default.json());
// Статические файлы
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/uploads', express_1.default.static(config_1.config.uploadDir));
// Получение списка файлов
app.get('/uploads', async (_req, res) => {
    try {
        const files = await promises_1.default.readdir(config_1.config.uploadDir);
        res.json(files.filter((file) => !file.startsWith('.')));
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка при получении списка файлов' });
    }
});
// Маршруты API
app.use('/api/images', image_routes_1.default);
app.use('/api/tarot', tarot_routes_1.default);
app.use('/api/cards', cards_routes_1.default);
// Маршрут для документации
app.get('/docs', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'docs', 'index.html'));
});
// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Что-то пошло не так!' });
});
// Запуск сервера
app.listen(config_1.config.port, () => {
    console.log(`Сервер запущен на порту ${config_1.config.port}`);
});
