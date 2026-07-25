// 全局状态
let canvas, ctx;
let currentImage = null;
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#2d3436';
let brushSize = 20;
let zoom = 1;
let offsetX = 0, offsetY = 0;
let history = [];
let historyIndex = -1;
let isVerified = true; // 调试模式：已验证
let gridSize = 100;
let threshold = 30;

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
    
    // 设置画布背景
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
    
    // 画笔设置
    document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('brushSizeValue').textContent = brushSize;
    });
    
    // 工具按钮
    document.getElementById('brushTool').addEventListener('click', () => selectTool('brush'));
    document.getElementById('eraserTool').addEventListener('click', () => selectTool('eraser'));
    
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
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
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
    // 调试模式：直接通过
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
                drawImageToCanvas(img);
                showCanvasEditor();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 绘制图片到画布
function drawImageToCanvas(img) {
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    
    saveHistory();
}

// 显示画布编辑器
function showCanvasEditor() {
    document.getElementById('uploadZone').classList.add('hidden');
    document.getElementById('canvasEditor').classList.remove('hidden');
}

// 选择工具
function selectTool(tool) {
    currentTool = tool;
    document.getElementById('brushTool').classList.toggle('active', tool === 'brush');
    document.getElementById('eraserTool').classList.toggle('active', tool === 'eraser');
    canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
}

// 开始绘制
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - offsetX;
    const y = (e.clientY - rect.top) / zoom - offsetY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// 绘制
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - offsetX;
    const y = (e.clientY - rect.top) / zoom - offsetY;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

// 停止绘制
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveHistory();
    }
}

// 触摸事件处理
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

// 保存历史
function saveHistory() {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push(canvas.toDataURL());
    
    // 限制历史记录数量
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
}

// 撤销
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        loadHistory();
    }
}

// 重做
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadHistory();
    }
}

// 加载历史
function loadHistory() {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyIndex];
}

// 清空画布
function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
}

// 缩放
function zoomIn() {
    zoom = Math.min(zoom * 1.2, 3);
}

function zoomOut() {
    zoom = Math.max(zoom / 1.2, 0.5);
}

// 下载图片
function downloadImage() {
    const link = document.createElement('a');
    link.download = '小猫拼豆图_' + Date.now() + '.png';
    link.href = canvas.toDataURL();
    link.click();
}

// 去背景
function removeBackground() {
    if (!currentImage) {
        alert('请先上传图片');
        return;
    }
    
    // 简单去背景：将接近白色的像素设为透明
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 判断是否接近白色
        if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // 设为透明
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    saveHistory();
}

// 更新参数显示
function updateParamDisplay() {
    const height = Math.round(gridSize * 1.1);
    document.getElementById('paramDisplay').textContent = `${gridSize}×${height}`;
    document.getElementById('resolutionTag').textContent = `分辨率 ${gridSize}×${height}`;
}

// 创建空白画布
function createBlankCanvas() {
    const size = 100;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    const cellSize = canvas.width / size;
    
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

// 卡密验证
async function verifyLicense() {
    const phone = document.getElementById('phone').value.trim();
    const license = document.getElementById('license').value.trim();
    const messageDiv = document.getElementById('message');
    const verifyBtn = document.getElementById('verifyBtn');
    
    // 验证手机号格式
    if (!/^1\d{10}$/.test(phone)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '请输入正确的11位手机号';
        return;
    }
    
    // 验证卡密格式
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
            setTimeout(() => {
                closeLicenseModal();
            }, 1000);
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

// 弹窗控制
function closeLicenseModal() {
    document.getElementById('licenseModal').classList.add('hidden');
}

function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

// 更新颜色列表
function updateColorList() {
    if (!currentImage) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colorMap = {};
    
    // 统计颜色
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        colorMap[color] = (colorMap[color] || 0) + 1;
    }
    
    // 排序并显示
    const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
    
    const colorList = document.getElementById('colorList');
    colorList.innerHTML = sortedColors.map(([color, count]) => `
        <div class="color-item-row" data-color="${color}">
            <div class="color-preview" style="background:${color}"></div>
            <div class="color-name">${color}</div>
            <div class="color-count">${count}</div>
        </div>
    `).join('');
    
    // 更新总数
    const total = sortedColors.reduce((sum, [_, count]) => sum + count, 0);
    document.getElementById('totalBeads').textContent = total;
}

// 初始化验证按钮
document.getElementById('verifyBtn')?.addEventListener('click', verifyLicense);

// 点击颜色列表项排除颜色
document.getElementById('colorList')?.addEventListener('click', (e) => {
    const row = e.target.closest('.color-item-row');
    if (row) {
        row.classList.toggle('excluded');
        const color = row.dataset.color;
        const isExcluded = row.classList.contains('excluded');
        
        // 实际排除逻辑（标记颜色）
        console.log(`${isExcluded ? '排除' : '恢复'}颜色: ${color}`);
    }
});
