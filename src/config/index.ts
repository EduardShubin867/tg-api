import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  uploadDir: path.join(__dirname, '../../uploads'),
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