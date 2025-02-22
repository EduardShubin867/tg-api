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

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')))

// Настраиваем статические файлы для uploads с поддержкой CORS
app.use(
    '/uploads',
    (req, res, next) => {
        res.setHeader(
            'Access-Control-Allow-Origin',
            'https://eduardshubin867-tarot-miniapp-e31c.twc1.net'
        )
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        next()
    },
    express.static(config.uploadDir)
)

// Получение списка файлов с информацией о директориях
app.get('/uploads/info', async (_req, res) => {
    try {
        const listFilesRecursively = async (dir: string): Promise<string[]> => {
            const files = await fs.readdir(dir, { withFileTypes: true })
            const paths = await Promise.all(
                files.map(async (dirent) => {
                    const res = path.join(dir, dirent.name)
                    if (dirent.isDirectory()) {
                        const subFiles = await listFilesRecursively(res)
                        return subFiles
                    }
                    return res
                })
            )
            return paths.flat()
        }

        const files = await listFilesRecursively(config.uploadDir)
        const relativePaths = files
            .map((file) => path.relative(config.uploadDir, file))
            .filter((file) => !file.startsWith('.'))

        console.log('Available files:', relativePaths)
        res.json(relativePaths)
    } catch (error) {
        console.error('Error listing files:', error)
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
