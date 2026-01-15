// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Основные элементы
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const coordsDisplay = document.getElementById('coords');
    const statusDisplay = document.getElementById('status');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    // Состояние рисования
    let drawingState = {
        isDrawing: false,
        currentTool: 'brush',
        currentColor: '#000000',
        brushSize: 5,
        opacity: 1.0,
        lastX: 0,
        lastY: 0,
        history: [],
        historyIndex: -1
    };

    // Инициализация канваса
    function initCanvas() {
        // Белый фон
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Настройки по умолчанию
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        updateBrushSettings();

        // Сохраняем начальное состояние в историю
        saveToHistory();
    }

    // Обновление настроек кисти
    function updateBrushSettings() {
        ctx.strokeStyle = drawingState.currentColor;
        ctx.lineWidth = drawingState.brushSize;
        ctx.globalAlpha = drawingState.opacity;

        if (drawingState.currentTool === 'eraser') {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = drawingState.brushSize * 2;
        }
    }

    // Сохранение в историю
    function saveToHistory() {
        // Сохраняем только последние 50 состояний
        if (drawingState.historyIndex < drawingState.history.length - 1) {
            drawingState.history = drawingState.history.slice(0, drawingState.historyIndex + 1);
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawingState.history.push(imageData);
        drawingState.historyIndex++;

        if (drawingState.history.length > 50) {
            drawingState.history.shift();
            drawingState.historyIndex--;
        }
    }

    // Отмена действия
    function undo() {
        if (drawingState.historyIndex > 0) {
            drawingState.historyIndex--;
            const imageData = drawingState.history[drawingState.historyIndex];
            ctx.putImageData(imageData, 0, 0);
            updateStatus('Отменено последнее действие');
        } else {
            updateStatus('Нечего отменять');
        }
    }

    // Возврат действия
    function redo() {
        if (drawingState.historyIndex < drawingState.history.length - 1) {
            drawingState.historyIndex++;
            const imageData = drawingState.history[drawingState.historyIndex];
            ctx.putImageData(imageData, 0, 0);
            updateStatus('Возвращено последнее действие');
        } else {
            updateStatus('Нечего возвращать');
        }
    }

    // Обновление статуса
    function updateStatus(message) {
        statusDisplay.textContent = message;
        statusDisplay.style.color = '#4A00E0';

        setTimeout(() => {
            statusDisplay.textContent = 'Готов к рисованию';
            statusDisplay.style.color = '#666';
        }, 2000);
    }

    // Начало рисования
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        drawingState.lastX = e.clientX - rect.left;
        drawingState.lastY = e.clientY - rect.top;
        drawingState.isDrawing = true;

        if (drawingState.currentTool === 'text') {
            showTextModal(drawingState.lastX, drawingState.lastY);
            return;
        }

        ctx.beginPath();
        ctx.moveTo(drawingState.lastX, drawingState.lastY);

        // Для фигур начинаем с точки
        if (drawingState.currentTool !== 'brush' && drawingState.currentTool !== 'eraser') {
            // Сохраняем начальную точку для фигур
            drawingState.startX = drawingState.lastX;
            drawingState.startY = drawingState.lastY;
        }
    });

    // Процесс рисования
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Обновляем координаты
        coordsDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;

        if (!drawingState.isDrawing) return;

        updateBrushSettings();

        switch(drawingState.currentTool) {
            case 'brush':
            case 'eraser':
                // Плавное рисование кистью/ластиком
                ctx.lineTo(x, y);
                ctx.stroke();
                drawingState.lastX = x;
                drawingState.lastY = y;
                break;

            case 'line':
                // Предпросмотр линии
                redrawCanvas();
                ctx.beginPath();
                ctx.moveTo(drawingState.startX, drawingState.startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;

            case 'rectangle':
                // Предпросмотр прямоугольника
                redrawCanvas();
                const width = x - drawingState.startX;
                const height = y - drawingState.startY;
                ctx.strokeRect(drawingState.startX, drawingState.startY, width, height);
                break;

            case 'circle':
                // Предпросмотр круга
                redrawCanvas();
                const radius = Math.sqrt(
                    Math.pow(x - drawingState.startX, 2) +
                    Math.pow(y - drawingState.startY, 2)
                );
                ctx.beginPath();
                ctx.arc(drawingState.startX, drawingState.startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
    });

    // Завершение рисования
    canvas.addEventListener('mouseup', (e) => {
        if (!drawingState.isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Завершаем рисование фигур
        if (drawingState.currentTool !== 'brush' && drawingState.currentTool !== 'eraser') {
            updateBrushSettings();

            switch(drawingState.currentTool) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(drawingState.startX, drawingState.startY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    break;

                case 'rectangle':
                    const width = x - drawingState.startX;
                    const height = y - drawingState.startY;
                    ctx.strokeRect(drawingState.startX, drawingState.startY, width, height);
                    break;

                case 'circle':
                    const radius = Math.sqrt(
                        Math.pow(x - drawingState.startX, 2) +
                        Math.pow(y - drawingState.startY, 2)
                    );
                    ctx.beginPath();
                    ctx.arc(drawingState.startX, drawingState.startY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
            }
        }

        drawingState.isDrawing = false;
        saveToHistory();
        updateStatus('Рисование завершено');
    });

    // Перерисовка канваса (для предпросмотра)
    function redrawCanvas() {
        if (drawingState.historyIndex >= 0) {
            const imageData = drawingState.history[drawingState.historyIndex];
            ctx.putImageData(imageData, 0, 0);
        }
    }

    // Показать модальное окно для текста
    function showTextModal(x, y) {
        const modal = document.getElementById('textModal');
        const textInput = document.getElementById('textInput');
        const insertBtn = document.getElementById('insertTextBtn');
        const cancelBtn = document.getElementById('cancelTextBtn');

        modal.style.display = 'flex';
        textInput.focus();

        // Сохраняем координаты для вставки текста
        drawingState.textX = x;
        drawingState.textY = y;

        // Вставить текст
        insertBtn.onclick = function() {
            if (textInput.value.trim()) {
                ctx.font = `${drawingState.brushSize * 3}px Arial`;
                ctx.fillStyle = drawingState.currentColor;
                ctx.globalAlpha = drawingState.opacity;
                ctx.fillText(textInput.value, x, y);
                saveToHistory();
                updateStatus('Текст добавлен');
            }
            modal.style.display = 'none';
            textInput.value = '';
        };

        // Отмена
        cancelBtn.onclick = function() {
            modal.style.display = 'none';
            textInput.value = '';
        };

        // Закрытие по клику вне модалки
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                textInput.value = '';
            }
        };
    }

    // Обработчики инструментов
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');

            drawingState.currentTool = this.dataset.tool;
            updateStatus(`Выбран инструмент: ${this.dataset.tool}`);
        });
    });

    // Обработчики цветов
    document.querySelectorAll('.color-option').forEach(color => {
        color.addEventListener('click', function() {
            drawingState.currentColor = this.dataset.color;
            updateBrushSettings();

            // Обновляем кастомный цвет
            document.getElementById('customColor').value = this.dataset.color;
            updateStatus(`Выбран цвет: ${this.dataset.color}`);
        });
    });

    // Кастомный цвет
    document.getElementById('customColor').addEventListener('input', function() {
        drawingState.currentColor = this.value;
        updateBrushSettings();
    });

    // Настройки кисти
    document.getElementById('brushSize').addEventListener('input', function() {
        drawingState.brushSize = this.value;
        document.getElementById('sizeValue').textContent = this.value;
        updateBrushSettings();
    });

    document.getElementById('opacity').addEventListener('input', function() {
        drawingState.opacity = this.value / 100;
        document.getElementById('opacityValue').textContent = this.value;
        updateBrushSettings();
    });

    // Кнопки действий
    document.getElementById('clearBtn').addEventListener('click', function() {
        if (confirm('Очистить весь рисунок?')) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveToHistory();
            updateStatus('Холст очищен');
        }
    });

    document.getElementById('saveBtn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'мой-рисунок.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        updateStatus('Рисунок сохранен как PNG');
    });

    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);

    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }

        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }

        // Быстрый выбор инструментов (1-6)
        if (e.key >= '1' && e.key <= '6') {
            const tools = ['brush', 'line', 'rectangle', 'circle', 'text', 'eraser'];
            const index = parseInt(e.key) - 1;
            if (index < tools.length) {
                drawingState.currentTool = tools[index];

                // Обновляем UI
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                document.querySelector(`.tool-btn[data-tool="${tools[index]}"]`).classList.add('active');

                updateStatus(`Выбран инструмент: ${tools[index]} (горячая клавиша ${e.key})`);
            }
        }
    });

    // Чат (демо-функционал)
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `<strong>Вы:</strong> ${message}`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            messageInput.value = '';
            updateStatus('Сообщение отправлено');
        }
    }

    // Другие кнопки
    document.getElementById('fullscreenBtn').addEventListener('click', function() {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        }
        updateStatus('Полноэкранный режим');
    });

    document.getElementById('helpBtn').addEventListener('click', function() {
        alert('Доска для рисования v1.0\n\nИспользуйте:\n- ЛКМ для рисования\n- Выбирайте инструменты слева\n- Ctrl+Z для отмены\n- Сохраняйте рисунок кнопкой "Сохранить"');
    });

    // Инициализация
    initCanvas();
    updateStatus('Доска готова к использованию!');

    // Добавляем тестовый рисунок
    setTimeout(() => {
        ctx.fillStyle = '#4cd964';
        ctx.fillRect(50, 50, 100, 80);

        ctx.strokeStyle = '#007aff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(200, 200, 50, 0, Math.PI * 2);
        ctx.stroke();

        saveToHistory();
        updateStatus('Тестовый рисунок добавлен');
    }, 500);
});