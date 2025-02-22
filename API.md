# API Documentation - Image CDN

## Базовый URL

```
http://localhost:3000/api/images
```

## Эндпоинты

### Загрузка изображения

Загружает новое изображение и автоматически конвертирует его в WebP формат.

```http
POST /api/images/upload
Content-Type: multipart/form-data
```

**Параметры запроса:**
| Параметр | Тип | Описание |
|----------|--------|-----------------------------------------------|
| image | File | Файл изображения (jpg, jpeg, png, gif, webp) |

**Пример запроса:**

```bash
curl -X POST http://localhost:3000/api/images/upload \
  -F "image=@photo.jpg"
```

**Успешный ответ (200 OK):**

```json
{
    "filename": "photo_original.webp",
    "format": "webp",
    "size": "original",
    "width": 1920,
    "height": 1080
}
```

### Получение изображения

Получает изображение с опциональными параметрами размера.

```http
GET /api/images/serve/:filename
```

**Параметры запроса:**
| Параметр | Тип | Описание | Обязательный |
|----------|--------|---------------------------------------------|--------------|
| size | string | Размер изображения (thumbnail/medium/large) | Нет |

**Поддерживаемые размеры:**

- thumbnail: 150x150px
- medium: 300x300px
- large: 800x800px

**Пример запроса:**

```bash
# Получение оригинального изображения
curl http://localhost:3000/api/images/serve/photo_original.webp

# Получение уменьшенной версии
curl http://localhost:3000/api/images/serve/photo_original.webp?size=thumbnail
```

### Получение информации об изображении

Возвращает метаданные изображения.

```http
GET /api/images/:filename/info
```

**Пример запроса:**

```bash
curl http://localhost:3000/api/images/photo_original.webp/info
```

**Успешный ответ (200 OK):**

```json
{
    "filename": "photo_original.webp",
    "format": "webp",
    "width": 1920,
    "height": 1080,
    "size": 153478,
    "created": "2024-02-22T12:00:00.000Z",
    "modified": "2024-02-22T12:00:00.000Z"
}
```

### Удаление изображения

Удаляет изображение и все его кэшированные версии.

```http
DELETE /api/images/:filename
```

**Пример запроса:**

```bash
curl -X DELETE http://localhost:3000/api/images/photo_original.webp
```

**Успешный ответ (200 OK):**

```json
{
    "message": "Изображение успешно удалено"
}
```

## Особенности и оптимизации

### WebP конвертация

- Все загруженные изображения автоматически конвертируются в формат WebP
- Используются оптимальные настройки сжатия:
    - quality: 80
    - effort: 6 (максимальное сжатие)
    - lossless: false (сжатие с потерями для лучшего размера)

### Кэширование

- Все трансформированные версии изображений кэшируются
- Кэш автоматически очищается при удалении оригинального изображения
- Установлены оптимальные заголовки кэширования для браузеров

### Безопасность

- Валидация типов файлов
- Ограничение размера загружаемых файлов (5MB)
- Защита от XSS через заголовки CSP
- CORS настройки для контроля доступа

## Коды ошибок

| Код | Описание                                         |
| --- | ------------------------------------------------ |
| 400 | Неверный запрос (неподдерживаемый формат и т.д.) |
| 404 | Изображение не найдено                           |
| 413 | Превышен максимальный размер файла               |
| 500 | Внутренняя ошибка сервера                        |

## Примеры использования

### HTML

```html
<!-- Оригинальное изображение -->
<img src="http://localhost:3000/api/images/serve/photo_original.webp" />

<!-- Уменьшенная версия -->
<img
    src="http://localhost:3000/api/images/serve/photo_original.webp?size=thumbnail"
/>
```

### JavaScript Fetch

```javascript
// Загрузка изображения
const formData = new FormData()
formData.append('image', fileInput.files[0])

const response = await fetch('http://localhost:3000/api/images/upload', {
    method: 'POST',
    body: formData,
})

const result = await response.json()
```
