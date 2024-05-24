document.addEventListener('DOMContentLoaded', function() {
    // HTML elemanlarının seçimi
    const colorPicker = document.getElementById('color-picker');
    const resultDiv = document.getElementById('color-result');
    const presetColors = document.querySelectorAll('.preset-color');
    const openColorPickerButton = document.getElementById('open-color-picker');
    const customColors = document.querySelectorAll('.custom-color');
    const drawingCanvas = document.getElementById('drawing-canvas');
    const pencilToolButton = document.getElementById('tool-pencil');
    const highlighterToolButton = document.getElementById('tool-highlighter');
    const fillToolButton = document.getElementById('tool-fill');
    const eraserToolButton = document.getElementById('tool-eraser');
    const currentColorDisplay = document.getElementById('current-color-display');

    // Değişkenlerin tanımlanması
    let currentCustomColorButton = null;
    let drawingColor = '#000000';
    let isDrawing = false;
    let startX, startY;
    let activeTool = null;

    // Renk sonuçlarını güncelleme
    updateColorResult(drawingColor);

    // Kanvas boyutunu ayarlama fonksiyonu
    function adjustCanvasSize() {
        drawingCanvas.width = drawingCanvas.parentElement.clientWidth;
        drawingCanvas.height = drawingCanvas.parentElement.clientHeight;
    }

    // Pencere yeniden boyutlandırıldığında kanvas boyutunu ayarlama
    window.addEventListener('resize', adjustCanvasSize);
    adjustCanvasSize();

    // Kanvas 2D bağlamını alma
    const ctx = drawingCanvas.getContext('2d');

    // Kanvas üzerinde fare olayları
    drawingCanvas.addEventListener('mousedown', (e) => {
        if (activeTool === 'pencil' || activeTool === 'highlighter' || activeTool === 'eraser') {
            isDrawing = true;
            [startX, startY] = [e.offsetX, e.offsetY];
        } else if (activeTool === 'fill') {
            fillCanvas(drawingColor);
        }
    });

    drawingCanvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            if (activeTool === 'eraser') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 15;
            } else {
                ctx.strokeStyle = drawingColor;
                ctx.lineWidth = activeTool === 'highlighter' ? 15 : 3;
            }
            ctx.lineCap = 'round';
            ctx.globalAlpha = activeTool === 'highlighter' ? 0.5 : 1.0;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [startX, startY] = [e.offsetX, e.offsetY];
        }
    });

    drawingCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    drawingCanvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });

    // Önceden ayarlanmış renk butonları
    presetColors.forEach(button => {
        button.addEventListener('click', function() {
            const color = button.getAttribute('data-color');
            if (color) {
                currentCustomColorButton = null; // Özel renk butonlarından bağımsız hale getirmek için sıfırla
                colorPicker.value = color;
                updateColorResult(color);
            }
        });
    });

    // Renk seçici butonuna tıklama olayı
    openColorPickerButton.addEventListener('click', function() {
        colorPicker.value = '#ffffff'; // Renk seçiciyi varsayılan beyaz renge sıfırlanır
        currentCustomColorButton = null;
        colorPicker.click();
    });

    // Renk seçici girdi olayı
    colorPicker.addEventListener('input', function() {
        if (currentCustomColorButton) {
            handleCustomColorInput();
        } else {
            handlePresetColorInput();
        }
    });

    // Özel renk butonları
    customColors.forEach(button => {
        button.addEventListener('click', function() {
            const color = button.getAttribute('data-color');
            if (color) {
                updateColorResult(color);
            } else {
                currentCustomColorButton = button;
                colorPicker.value = '#ffffff'; // Önceden ayarlanmış renk girişimlerini önlemek için sıfırla
                colorPicker.click();
            }
        });
    });

    // Renk seçici değişim olayı
    colorPicker.addEventListener('change', function() {
        if (currentCustomColorButton) {
            currentCustomColorButton.style.backgroundColor = colorPicker.value;
            currentCustomColorButton.setAttribute('data-color', colorPicker.value);
            updateColorResult(colorPicker.value);
        }
    });

    // Özel renk girdisi işleme
    function handleCustomColorInput() {
        if (currentCustomColorButton) {
            currentCustomColorButton.style.backgroundColor = colorPicker.value;
            currentCustomColorButton.setAttribute('data-color', colorPicker.value);
            updateColorResult(colorPicker.value);
        }
    }

    // Önceden ayarlanmış renk girdisi işleme
    function handlePresetColorInput() {
        const color = colorPicker.value;
        updateColorResult(color);
    }

    // Renk sonuçlarını güncelleme fonksiyonu
    function updateColorResult(color) {
        drawingColor = color;
        currentColorDisplay.style.backgroundColor = color;
        const formData = new FormData();
        formData.append('color', color);

        fetch('/get-color', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.innerHTML = `
                <p class="color-info color-hex" style="color: ${data.color};">Seçilen Renk: ${data.color}</p>
                <p class="color-info color-red">Kırmızı: ${data.redPercent}%</p>
                <p class="color-info color-green">Yeşil: ${data.greenPercent}%</p>
                <p class="color-info color-blue">Mavi: ${data.bluePercent}%</p>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Araç aktivasyonunu işleme
    pencilToolButton.addEventListener('click', function() {
        setActiveTool('pencil');
    });

    highlighterToolButton.addEventListener('click', function() {
        setActiveTool('highlighter');
    });

    fillToolButton.addEventListener('click', function() {
        setActiveTool('fill');
    });

    eraserToolButton.addEventListener('click', function() {
        setActiveTool('eraser');
    });

    // Aktif aracı ayarlama fonksiyonu
    function setActiveTool(tool) {
        activeTool = tool;
        pencilToolButton.classList.toggle('active-tool', tool === 'pencil');
        highlighterToolButton.classList.toggle('active-tool', tool === 'highlighter');
        fillToolButton.classList.toggle('active-tool', tool === 'fill');
        eraserToolButton.classList.toggle('active-tool', tool === 'eraser');
    }

    // Kanvası belirli bir renk ile doldurma fonksiyonu
    function fillCanvas(color) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 1.0; // Doldurma için alpha değerini sıfırlanır
        ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
});
