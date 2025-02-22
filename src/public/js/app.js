const uploadForm = document.getElementById('uploadForm')
const imageInput = document.getElementById('imageInput')
const uploadButton = uploadForm.querySelector('.upload-button')
const loading = document.getElementById('loading')
const errorMessage = document.getElementById('errorMessage')
const successMessage = document.getElementById('successMessage')
const fileInfo = document.getElementById('fileInfo')
const imagesGrid = document.getElementById('imagesGrid')

// Обработка выбора файла
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0]
    if (file) {
        fileInfo.textContent = `Выбран файл: ${file.name}`
        uploadButton.disabled = false
    } else {
        fileInfo.textContent = ''
        uploadButton.disabled = true
    }
})

// Загрузка изображения
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const file = imageInput.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    loading.classList.add('active')
    errorMessage.classList.remove('active')
    successMessage.classList.remove('active')
    uploadButton.disabled = true

    try {
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error('Ошибка при загрузке')
        }

        const result = await response.json()

        // Создаем и добавляем новую карточку
        const card = createImageCard(result.filename)
        imagesGrid.insertBefore(card, imagesGrid.firstChild)

        successMessage.textContent = 'Изображение успешно загружено!'
        successMessage.classList.add('active')
        uploadForm.reset()
        fileInfo.textContent = ''
    } catch (error) {
        errorMessage.textContent = error.message
        errorMessage.classList.add('active')
    } finally {
        loading.classList.remove('active')
        uploadButton.disabled = true
    }
})

// Загрузка списка изображений
async function loadImages() {
    try {
        const response = await fetch('/uploads')
        if (!response.ok) throw new Error('Ошибка при загрузке списка')

        const files = await response.json()
        imagesGrid.innerHTML = ''

        // Сортируем файлы по дате создания (новые сверху)
        files
            .filter((file) => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .sort((a, b) => {
                const aMatch = a.match(/(\d+)-\d+/)
                const bMatch = b.match(/(\d+)-\d+/)
                if (aMatch && bMatch) {
                    return Number(bMatch[1]) - Number(aMatch[1])
                }
                return 0
            })
            .forEach((file) => {
                const card = createImageCard(file)
                imagesGrid.appendChild(card)
            })
    } catch (error) {
        console.error('Ошибка при загрузке списка:', error)
    }
}

// Создание карточки изображения
function createImageCard(filename) {
    const card = document.createElement('div')
    card.className = 'image-card'

    const img = document.createElement('img')
    img.className = 'image-preview'
    img.src = `/api/images/serve/${filename}?size=thumbnail`
    img.alt = filename

    const info = document.createElement('div')
    info.className = 'image-info'
    info.textContent = filename

    const actions = document.createElement('div')
    actions.className = 'image-actions'

    const viewButton = document.createElement('button')
    viewButton.className = 'action-button view-button'
    viewButton.textContent = 'Просмотр'
    viewButton.onclick = () =>
        window.open(`/api/images/serve/${filename}`, '_blank')

    const deleteButton = document.createElement('button')
    deleteButton.className = 'action-button delete-button'
    deleteButton.textContent = 'Удалить'
    deleteButton.onclick = async () => {
        if (confirm('Удалить изображение?')) {
            try {
                const response = await fetch(`/api/images/${filename}`, {
                    method: 'DELETE',
                })
                if (response.ok) {
                    card.remove()
                }
            } catch (error) {
                console.error('Ошибка при удалении:', error)
            }
        }
    }

    actions.appendChild(viewButton)
    actions.appendChild(deleteButton)

    card.appendChild(img)
    card.appendChild(info)
    card.appendChild(actions)

    return card
}

// Загружаем список изображений при загрузке страницы
loadImages()
