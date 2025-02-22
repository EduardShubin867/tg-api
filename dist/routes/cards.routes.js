"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const Card_1 = require("../models/Card");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        await (0, mongodb_1.default)();
        const cards = await Card_1.Card.find({}).sort({ id: 1 });
        res.json(cards);
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка при получении карт' });
    }
});
exports.default = router;
