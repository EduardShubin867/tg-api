import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs/promises'
import imageRoutes from './routes/image.routes'
import tarotRoutes from './routes/tarot.routes'
import cardsRoutes from './routes/cards.routes'
import { config } from './config'

const app = express()

// Настройка Helmet с CSP
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", 'cdnjs.cloudflare.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
                imgSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://mvtgbotapi.ru',
                    'https://eduardshubin867-tarot-miniapp-e31c.twc1.net',
                ],
                connectSrc: ["'self'", 'api.openai.com'],
                fontSrc: ["'self'", 'cdnjs.cloudflare.com'],
            },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false,
    })
)

// Настройка CORS
app.use(
    cors({
        origin: [
            'https://eduardshubin867-tarot-miniapp-e31c.twc1.net',
            'http://localhost:5173',
            'http://localhost:3000',
        ],
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        exposedHeaders: ['Content-Type', 'Content-Length'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 86400, // 24 часа
    })
)

// Добавляем промежуточное ПО для предварительной проверки CORS
app.options('*', cors()) // Включаем предварительную проверку CORS для всех маршрутов

app.use(express.json())

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(config.uploadDir))

// Получение списка файлов
app.get('/uploads', async (_req, res) => {
    try {
        const files = await fs.readdir(config.uploadDir)
        res.json(files.filter((file) => !file.startsWith('.')))
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении списка файлов' })
    }
})

// Маршруты API
app.use('/api/images', imageRoutes)
app.use('/api/tarot', tarotRoutes)
app.use('/api/cards', cardsRoutes)

// Маршрут для документации
app.get('/docs', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs', 'index.html'))
})

// Обработка ошибок
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(err.stack)
        res.status(500).json({ error: 'Что-то пошло не так!' })
    }
)

// Запуск сервера
app.listen(config.port, () => {
    console.log(`Сервер запущен на порту ${config.port}`)
})
