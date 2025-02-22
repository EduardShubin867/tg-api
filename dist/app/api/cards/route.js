"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const mongodb_1 = __importDefault(require("../../../lib/mongodb"));
const Card_1 = require("../../../models/Card");
async function GET() {
    try {
        await (0, mongodb_1.default)();
        const cards = await Card_1.Card.find({}).sort({ id: 1 });
        return server_1.NextResponse.json(cards);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Ошибка при получении карт' }, { status: 500 });
    }
}
