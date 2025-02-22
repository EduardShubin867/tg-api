import express from 'express'
import dbConnect from '../lib/mongodb'
import { Card } from '../models/Card'

const router = express.Router()

router.get('/', async (_req, res) => {
    try {
        await dbConnect()
        const cards = await Card.find({}).sort({ id: 1 })
        res.json(cards)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении карт' })
    }
})

export default router
