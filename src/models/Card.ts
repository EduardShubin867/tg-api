import mongoose from 'mongoose'

const cardSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    meaning: { type: String, required: true },
    image: { type: String, required: true },
})

export const Card = mongoose.models.Card || mongoose.model('Card', cardSchema)
