import { cards } from '../src/data/cards'
import dbConnect from '../src/lib/mongodb'
import { Card } from '../src/models/Card'

async function seedDatabase() {
    try {
        await dbConnect()

        // Очищаем существующие данные
        await Card.deleteMany({})

        // Вставляем карты
        await Card.insertMany(cards)

        console.log('База данных успешно заполнена!')
        process.exit(0)
    } catch (error) {
        console.error('Ошибка при заполнении базы данных:', error)
        process.exit(1)
    }
}

seedDatabase()
