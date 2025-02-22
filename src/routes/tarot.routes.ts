import { Router, Request, Response } from 'express'
import axios from 'axios'
import { cards as tarotCards } from '../data/cards'

const router = Router()

// Middleware для логирования
router.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
    next()
})

// Маршрут для интерпретации
router.post('/interpretation', async (req: Request, res: Response) => {
    console.log('Получен запрос на интерпретацию')
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini-2024-07-18',
                messages: req.body.messages,
                temperature: 0.9,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        console.log('Успешный ответ от OpenAI')
        res.json(response.data)
    } catch (error) {
        console.error(
            'Ошибка:',
            error instanceof Error ? error.message : 'Unknown error'
        )
        res.status(500).json({
            error: 'Ошибка при получении интерпретации',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
    }
})

// Маршрут для генерации расклада
router.post('/spread', async (req: Request, res: Response) => {
    try {
        // Генерируем расклад
        const shuffled = [...tarotCards].sort(() => 0.5 - Math.random())
        const spread = {
            past: shuffled[0],
            present: shuffled[1],
            future: shuffled[2],
        }

        // Запрашиваем интерпретацию
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini-2024-07-18',
                messages: [
                    {
                        role: 'user',
                        content: `Ты - мистический оракул, древний провидец, говорящий загадочно и поэтично.
                        Интерпретируй расклад карт Таро, создавая атмосферу тайны и магии:

                        Прошлое: ${spread.past.name} (${spread.past.meaning})
                        Настоящее: ${spread.present.name} (${spread.present.meaning})
                        Будущее: ${spread.future.name} (${spread.future.meaning})

                        Структурируй ответ следующим образом:

                        1. Начни с загадочного обращения
                        2. Дай общее описание ситуации
                        3. Для каждой карты:
                           - Подробно опиши значение в контексте позиции
                           - Как она связана с другими картами
                        4. Заверши пророческим напутствием

                        Используй форматирование markdown:
                        - **жирным** выделяй названия карт
                        - *курсивом* - ключевые предсказания
                        - Используй ### для разделов

                        Общий объем: 300-400 слов.`,
                    },
                ],
                temperature: 0.9,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        // Отправляем клиенту и расклад, и интерпретацию
        res.json({
            spread: {
                past: {
                    ...spread.past,
                    imageUrl: `${req.protocol}://${req.get('host')}/uploads/cards/${spread.past.image}`,
                },
                present: {
                    ...spread.present,
                    imageUrl: `${req.protocol}://${req.get('host')}/uploads/cards/${spread.present.image}`,
                },
                future: {
                    ...spread.future,
                    imageUrl: `${req.protocol}://${req.get('host')}/uploads/cards/${spread.future.image}`,
                },
            },
            interpretation: response.data.choices[0].message.content,
        })
    } catch (error) {
        console.error('Ошибка при генерации расклада:', error)
        res.status(500).json({ error: 'Ошибка при генерации расклада' })
    }
})

// Тестовый маршрут
router.get('/', (_req: Request, res: Response) => {
    res.send('Tarot API is running')
})

export default router
