// 全局状态
let canvas, ctx;
let previewCanvas, previewCtx;
let currentImage = null;
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#2d3436';
let brushSize = 20;
let zoom = 1;
let offsetX = 0, offsetY = 0;
let history = [];
let historyIndex = -1;
let isVerified = true;
let gridSize = 40; // 默认网格尺寸
let threshold = 30;
let excludedColors = new Set();
let processMode = 'cartoon';

// 拼豆颜色库（常见拼豆颜色）
const PERLER_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#FF6B6B', '#FF9F43', '#FECA57',
    '#96ceb4', '#00B894', '#009432', '#00D2D3', '#45B7D1', '#54A0FF',
    '#5F27CD', '#9B59B6', '#FF9FF3', '#8B4513', '#D2691E', '#F5DEB3',
    '#808080', '#C0C0C0', '#FFD700', '#FFC0CB', '#A52A2A', '#2D3436'
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initEventListeners();
    checkVerification();
});

// 初始化画布
function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
}

// 初始化事件监听
function initEventListeners() {
    // 上传区域
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // 模式切换
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // 参数滑块
    document.getElementById('gridSize').addEventListener('input', (e) => {
        gridSize = parseInt(e.target.value);
        document.getElementById('gridSizeValue').textContent = gridSize;
        updateParamDisplay();
    });
    
    document.getElementById('threshold').addEventListener('input', (e) => {
        threshold = parseInt(e.target.value);
        document.getElementById('thresholdValue').textContent = threshold;
    });
    
    // 处理模式
    document.getElementById('processMode')?.addEventListener('change', (e) => {
        processMode = e.target.value;
    });
    
    // 画笔设置
    document.getElementById('brushSize')?.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        const brushSizeValue = document.getElementById('brushSizeValue');
        if (brushSizeValue) brushSizeValue.textContent = brushSize;
    });
    
    // 工具按钮
    const brushBtn = document.getElementById('brushTool');
    const eraserBtn = document.getElementById('eraserTool');
    brushBtn?.addEventListener('click', () => selectTool('brush'));
    eraserBtn?.addEventListener('click', () => selectTool('eraser'));
    
    // 颜色选择
    document.querySelectorAll('.color-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.color-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentColor = item.dataset.color;
        });
    });
    
    // 画布绘制事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 触摸支持
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

// 检查验证状态
function checkVerification() {
    const lastVerify = localStorage.getItem('lastVerify');
    if (lastVerify) {
        const verifyTime = new Date(lastVerify).getTime();
        const now = Date.now();
        const hours24 = 24 * 60 * 60 * 1000;
        if (now - verifyTime < hours24) {
            isVerified = true;
            return;
        }
    }
    isVerified = true;
}

// 处理文件拖放
function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 处理文件
function processFile(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                // 上传后自动生成拼豆图
                generatePerlerBeads();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 显示画布编辑器
function showCanvasEditor() {
    const uploadZone = document.getElementById('uploadZone');
    const canvasEditor = document.getElementById('canvasEditor');
    uploadZone?.classList.add('hidden');
    canvasEditor?.classList.remove('hidden');
}

// ========== 核心：生成拼豆图纸 ==========

function generatePerlerBeads() {
    if (!currentImage) {
        alert('请先上传图片');
        return;
    }
    
    showCanvasEditor();
    
    // 计算画布尺寸
    const aspectRatio = currentImage.height / currentImage.width;
    const height = Math.round(gridSize * aspectRatio);
    
    // 更新分辨率显示
    document.getElementById('paramDisplay').textContent = `${gridSize}×${height}`;
    document.getElementById('resolutionTag').textContent = `分辨率 ${gridSize}×${height}`;
    
    // 创建临时画布处理图片
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = gridSize;
    tempCanvas.height = height;
    
    // 绘制缩小的图片
    tempCtx.drawImage(currentImage, 0, 0, gridSize, height);
    
    // 获取像素数据
    const imageData = tempCtx.getImageData(0, 0, gridSize, height);
    const pixels = imageData.data;
    
    // 处理模式：卡通（减少颜色）
    if (processMode === 'cartoon') {
        reduceColors(pixels, gridSize * height);
    }
    
    // 清空主画布并绘制拼豆图纸
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = Math.min(canvas.width / gridSize, canvas.height / height);
    const offsetX = (canvas.width - cellSize * gridSize) / 2;
    const offsetY = (canvas.height - cellSize * height) / 2;
    
    // 绘制每个像素点
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < gridSize; x++) {
            const i = (y * gridSize + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            
            // 跳过透明像素
            if (a < 128) continue;
            
            // 找到最接近的拼豆颜色
            const closestColor = findClosestPerlerColor(r, g, b);
            
            // 检查是否被排除
            if (excludedColors.has(closestColor.toUpperCase())) continue;
            
            // 绘制圆形像素点（拼豆效果）
            const px = offsetX + x * cellSize + cellSize / 2;
            const py = offsetY + y * cellSize + cellSize / 2;
            const radius = cellSize * 0.45;
            
            // 绘制主体圆形
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = closestColor;
            ctx.fill();
            
            // 添加高光效果
            ctx.beginPath();
            ctx.arc(px - radius * 0.25, py - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
    }
    
    // 绘制网格线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= gridSize; x++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + x * cellSize, offsetY);
        ctx.lineTo(offsetX + x * cellSize, offsetY + height * cellSize);
        ctx.stroke();
    }
    
    for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + y * cellSize);
        ctx.lineTo(offsetX + gridSize * cellSize, offsetY + y * cellSize);
        ctx.stroke();
    }
    
    // 绘制边框
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, gridSize * cellSize, height * cellSize);
    
    saveHistory();
    updateColorList();
}

// 卡通模式：减少颜色数量
function reduceColors(pixels, total) {
    for (let i = 0; i < total * 4; i += 4) {
        // 根据阈值调整颜色
        const factor = threshold / 100;
        pixels[i] = Math.round(pixels[i] / 64 * factor * 64);     // R
        pixels[i + 1] = Math.round(pixels[i + 1] / 64 * factor * 64); // G
        pixels[i + 2] = Math.round(pixels[i + 2] / 64 * factor * 64); // B
    }
}

// 找到最接近的拼豆颜色
function findClosestPerlerColor(r, g, b) {
    let minDistance = Infinity;
    let closestColor = PERLER_COLORS[0];
    
    for (const color of PERLER_COLORS) {
        const rgb = hexToRgb(color);
        const distance = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    
    return closestColor;
}

// HEX 转 RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// 计算颜色距离
function colorDistance(r1, g1, b1, r2, g2, b2) {
    // 使用加权欧几里得距离，更符合人眼感知
    return Math.sqrt(
        2 * Math.pow(r1 - r2, 2) +
        4 * Math.pow(g1 - g2, 2) +
        3 * Math.pow(b1 - b2, 2)
    );
}

// 更新颜色列表
function updateColorList() {
    if (!currentImage) return;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const aspectRatio = currentImage.height / currentImage.width;
    const height = Math.round(gridSize * aspectRatio);
    
    tempCanvas.width = gridSize;
    tempCanvas.height = height;
    tempCtx.drawImage(currentImage, 0, 0, gridSize, height);
    
    const imageData = tempCtx.getImageData(0, 0, gridSize, height);
    const pixels = imageData.data;
    const colorMap = {};
    
    // 统计颜色
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) continue;
        
        const closestColor = findClosestPerlerColor(pixels[i], pixels[i + 1], pixels[i + 2]);
        
        if (!excludedColors.has(closestColor.toUpperCase())) {
            colorMap[closestColor] = (colorMap[closestColor] || 0) + 1;
        }
    }
    
    // 排序并显示
    const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const colorList = document.getElementById('colorList');
    if (colorList) {
        colorList.innerHTML = sortedColors.map(([color, count]) => `
            <div class="color-item-row ${excludedColors.has(color.toUpperCase()) ? 'excluded' : ''}" 
                 data-color="${color}" onclick="toggleExcludeColor('${color}')">
                <div class="color-preview" style="background:${color}"></div>
                <div class="color-name">${color}</div>
                <div class="color-count">${count}颗</div>
            </div>
        `).join('');
    }
    
    // 更新总数
    const total = sortedColors.reduce((sum, [_, count]) => sum + count, 0);
    const totalEl = document.getElementById('totalBeads');
    if (totalEl) totalEl.textContent = total;
}

// 切换排除颜色
function toggleExcludeColor(color) {
    const upperColor = color.toUpperCase();
    if (excludedColors.has(upperColor)) {
        excludedColors.delete(upperColor);
    } else {
        excludedColors.add(upperColor);
    }
    
    // 重新生成
    if (currentImage) {
        generatePerlerBeads();
    }
}

// 去背景
function removeBackground() {
    if (!currentImage) {
        alert('请先上传图片');
        return;
    }
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const aspectRatio = currentImage.height / currentImage.width;
    const height = Math.round(gridSize * aspectRatio);
    
    tempCanvas.width = gridSize;
    tempCanvas.height = height;
    tempCtx.drawImage(currentImage, 0, 0, gridSize, height);
    
    const imageData = tempCtx.getImageData(0, 0, gridSize, height);
    const pixels = imageData.data;
    
    // 简单的背景移除：检测接近白色的区域
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // 如果接近白色或高亮度，设为透明
        if ((r > 240 && g > 240 && b > 240) || (r + g + b > 720)) {
            pixels[i + 3] = 0;
        }
    }
    
    tempCtx.putImageData(imageData, 0, 0);
    currentImage = tempCanvas;
    
    generatePerlerBeads();
}

// ========== 绘图工具 ==========

function selectTool(tool) {
    currentTool = tool;
    document.getElementById('brushTool')?.classList.toggle('active', tool === 'brush');
    document.getElementById('eraserTool')?.classList.toggle('active', tool === 'eraser');
    canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveHistory();
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startDrawing(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    draw(mouseEvent);
}

// ========== 历史记录 ==========

function saveHistory() {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push(canvas.toDataURL());
    
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        loadHistory();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadHistory();
    }
}

function loadHistory() {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyIndex];
}

function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
}

// ========== 其他功能 ==========

function zoomIn() {
    zoom = Math.min(zoom * 1.2, 3);
}

function zoomOut() {
    zoom = Math.max(zoom / 1.2, 0.5);
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = '小猫拼豆图_' + Date.now() + '.png';
    link.href = canvas.toDataURL();
    link.click();
}

function updateParamDisplay() {
    const aspectRatio = currentImage ? currentImage.height / currentImage.width : 1.1;
    const height = Math.round(gridSize * aspectRatio);
    document.getElementById('paramDisplay').textContent = `${gridSize}×${height}`;
    document.getElementById('resolutionTag').textContent = `分辨率 ${gridSize}×${height}`;
}

function createBlankCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制空白网格
    const size = 40;
    const cellSize = canvas.width / size;
    
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    showCanvasEditor();
    saveHistory();
}

// ========== 卡密验证 ==========

async function verifyLicense() {
    const phone = document.getElementById('phone').value.trim();
    const license = document.getElementById('license').value.trim();
    const messageDiv = document.getElementById('message');
    const verifyBtn = document.getElementById('verifyBtn');
    
    if (!/^1\d{10}$/.test(phone)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '请输入正确的11位手机号';
        return;
    }
    
    if (license.length !== 10) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '卡密必须为10位';
        return;
    }
    
    verifyBtn.disabled = true;
    verifyBtn.textContent = '验证中...';
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, license })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '验证成功！';
            localStorage.setItem('lastVerify', new Date().toISOString());
            setTimeout(closeLicenseModal, 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || '验证失败，请检查卡密';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '网络错误，请稍后重试';
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = '验证卡密';
    }
}

// ========== 弹窗控制 ==========

function closeLicenseModal() {
    document.getElementById('licenseModal')?.classList.add('hidden');
}

function showLogin() {
    document.getElementById('loginModal')?.classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal')?.classList.add('hidden');
}

// 绑定验证按钮
document.getElementById('verifyBtn')?.addEventListener('click', verifyLicense);

// 将 toggleExcludeColor 暴露到全局
window.toggleExcludeColor = toggleExcludeColor;
