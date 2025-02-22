"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cardSchema = new mongoose_1.default.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    meaning: { type: String, required: true },
    image: { type: String, required: true },
});
exports.Card = mongoose_1.default.models.Card || mongoose_1.default.model('Card', cardSchema);
