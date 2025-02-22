"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    uploadDir: path_1.default.join(__dirname, '../../uploads'),
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    imageOptions: {
        quality: 80,
        formats: ['jpeg', 'webp', 'png'],
        sizes: {
            thumbnail: { width: 150, height: 150 },
            medium: { width: 300, height: 300 },
            large: { width: 800, height: 800 }
        }
    }
};
