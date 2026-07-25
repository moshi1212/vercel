// ==================== 全局状态 ====================
let isVerified = false;
let selectedColor = '#ff9f43';
let currentTool = 'brush';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let historyIndex = -1;
let currentImage = null;
let brushSize = 20;

// ==================== DOM 元素 ====================
const licenseModal = document.getElementById('licenseModal');
const loginModal = document.getElementById('loginModal');
const getLicenseBtn = document.getElementById('getLicenseBtn');
const verifyBtn = document.getElementById('verifyBtn');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const canvasEditor = document.getElementById('canvasEditor');
const colorItems = document.querySelectorAll('.color-item');
const toolBtns = document.querySelectorAll('.tool-btn');

// ==================== 卡密验证系统 ====================

// 打开卡密弹窗
getLicenseBtn.addEventListener('click', () => {
    // ⚠️ 验证已关闭，直接提示
    alert('🐱 验证功能已关闭，可直接使用所有功能！');
});

function closeLicenseModal() {
    licenseModal.classList.remove('active');
}

function showLogin() {
    loginModal.classList.add('active');
}

function closeLoginModal() {
    loginModal.classList.remove('active');
}

// 点击弹窗外部关闭
licenseModal.addEventListener('click', (e) => {
    if (e.target === licenseModal) closeLicenseModal();
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
});

// 验证卡密
verifyBtn.addEventListener('click', async () => {
    const phone = document.getElementById('phone').value.trim();
    const license = document.getElementById('license').value.trim();
    const message = document.getElementById('message');
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        showMessage('请输入正确的11位手机号', 'error');
        return;
    }
    
    if (!/^[a-zA-Z0-9]{10}$/.test(license)) {
        showMessage('卡密格式错误，请输入10位字母数字', 'error');
        return;
    }
    
    verifyBtn.textContent = '验证中...';
    verifyBtn.disabled = true;
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, key: license })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('✅ 验证成功！即将进入...', 'success');
            isVerified = true;
            localStorage.setItem('licenseVerified', 'true');
            localStorage.setItem('verifiedPhone', phone);
            localStorage.setItem('verifiedAt', Date.now().toString());
            
            setTimeout(() => {
                closeLicenseModal();
                enableFeatures();
            }, 1500);
        } else {
            showMessage(data.message || '验证失败，请检查卡密', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        verifyBtn.textContent = '验证卡密';
        verifyBtn.disabled = false;
    }
});

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
}

function enableFeatures() {
    uploadZone.style.borderColor = '#28a745';
    uploadZone.style.background = '#f0fff4';
    setTimeout(() => {
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
    }, 2000);
}

function checkVerification() {
    // ⚠️ 验证功能已临时关闭（调试模式）
    isVerified = true;
    return true;
    
    /* 原验证逻辑（已注释）
    const verified = localStorage.getItem('licenseVerified');
    const verifiedAt = localStorage.getItem('verifiedAt');
    
    if (verified && verifiedAt) {
        const hours24 = 24 * 60 * 60 * 1000;
        if (Date.now() - parseInt(verifiedAt) < hours24) {
            isVerified = true;
            return true;
        } else {
            localStorage.removeItem('licenseVerified');
            localStorage.removeItem('verifiedPhone');
            localStorage.removeItem('verifiedAt');
        }
    }
    return false;
    */
}

// ==================== 文件上传系统 ====================

uploadZone.addEventListener('click', () => {
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    fileInput.click();
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
    uploadZone.style.background = 'linear-gradient(135deg, #fff5f0 0%, #ffecd2 100%)';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            convertToPixelArt(img);
            showCanvasEditor();
            saveToHistory('上传图片');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==================== 拼豆转换核心算法 ====================

function convertToPixelArt(img) {
    // 设置拼豆参数
    const beadSize = 20; // 每个拼豆的大小
    const maxBeads = 40; // 最大拼豆数量
    
    // 计算缩放比例
    let newWidth, newHeight;
    if (img.width > img.height) {
        newWidth = maxBeads * beadSize;
        newHeight = Math.floor(img.height * (newWidth / img.width) / beadSize) * beadSize;
    } else {
        newHeight = maxBeads * beadSize;
        newWidth = Math.floor(img.width * (newHeight / img.height) / beadSize) * beadSize;
    }
    
    // 调整画布大小
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // 绘制原图到临时画布
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0, newWidth, newHeight);
    
    // 获取像素数据
    const imageData = tempCtx.getImageData(0, 0, newWidth, newHeight);
    const pixels = imageData.data;
    
    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newWidth, newHeight);
    
    // 拼豆化处理
    for (let y = 0; y < newHeight; y += beadSize) {
        for (let x = 0; x < newWidth; x += beadSize) {
            // 获取该区域的平均颜色
            const color = getAverageColor(pixels, x, y, beadSize, newWidth);
            
            // 映射到拼豆颜色
            const beadColor = mapToBeadColor(color);
            
            // 绘制拼豆
            drawBead(x, y, beadSize, beadColor);
        }
    }
    
    // 绘制网格
    drawGrid(newWidth, newHeight, beadSize);
    
    // 保存到历史记录
    saveHistoryToStorage('上传图片', canvas.toDataURL());
}

function getAverageColor(pixels, startX, startY, size, canvasWidth) {
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let y = startY; y < startY + size; y++) {
        for (let x = startX; x < startX + size; x++) {
            const i = (y * canvasWidth + x) * 4;
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            count++;
        }
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

function mapToBeadColor(color) {
    // 拼豆颜色库（简化版）
    const beadColors = [
        { r: 255, g: 107, b: 107, name: '红' },
        { r: 255, g: 159, b: 67, name: '橙' },
        { r: 254, g: 202, b: 87, name: '黄' },
        { r: 150, g: 206, b: 180, name: '绿' },
        { r: 69, g: 183, b: 209, name: '蓝' },
        { r: 95, g: 39, b: 205, name: '紫' },
        { r: 255, g: 159, b: 243, name: '粉' },
        { r: 255, g: 255, b: 255, name: '白' },
        { r: 45, g: 52, b: 54, name: '黑' },
        { r: 178, g: 190, b: 195, name: '灰' },
        { r: 0, g: 148, b: 50, name: '深绿' },
        { r: 238, g: 90, b: 36, name: '深红' }
    ];
    
    // 找最接近的颜色
    let minDistance = Infinity;
    let closestColor = beadColors[0];
    
    for (const bead of beadColors) {
        const distance = Math.sqrt(
            Math.pow(color.r - bead.r, 2) +
            Math.pow(color.g - bead.g, 2) +
            Math.pow(color.b - bead.b, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = bead;
        }
    }
    
    return closestColor;
}

function drawBead(x, y, size, color) {
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    // 绘制圆形拼豆
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x + size/3, y + size/3, size/6, 0, Math.PI * 2);
    ctx.fill();
}

function drawGrid(width, height, size) {
    ctx.strokeStyle = 'rgba(45, 52, 54, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// ==================== 画笔绘制系统 ====================

function showCanvasEditor() {
    uploadZone.classList.add('hidden');
    canvasEditor.classList.remove('hidden');
}

function createBlankCanvas() {
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    
    canvas.width = 800;
    canvas.height = 600;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(canvas.width, canvas.height, 20);
    
    showCanvasEditor();
    saveToHistory('新建画布');
}

// 画笔工具
canvas.addEventListener('mousedown', (e) => {
    if (!isVerified && !checkVerification()) return;
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    lastX = (e.clientX - rect.left) * scaleX;
    lastY = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (currentTool === 'brush') {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        saveToHistory('绘制');
    }
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// 工具选择
toolBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.style.borderColor = '');
        btn.style.borderColor = 'var(--primary)';
        
        switch(index) {
            case 0: currentTool = 'brush'; break;
            case 1: currentTool = 'eraser'; break;
            case 2: undo(); break;
            case 3: redo(); break;
            case 4: clearCanvas(); break;
            case 5: zoomOut(); break;
            case 6: zoomIn(); break;
            case 7: downloadImage(); break;
        }
    });
});

// ==================== 撤销/重做系统 ====================

function saveToHistory(action) {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push({
        action: action,
        data: canvas.toDataURL(),
        timestamp: Date.now()
    });
    
    // 限制历史记录数量
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        loadFromHistory();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadFromHistory();
    }
}

function loadFromHistory() {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyIndex].data;
}

function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(canvas.width, canvas.height, 20);
    saveToHistory('清空画布');
}

// ==================== 缩放功能 ====================

function zoomIn() {
    // 简单的视觉提示
    alert('放大功能：建议使用浏览器缩放（Ctrl + 加号）');
}

function zoomOut() {
    alert('缩小功能：建议使用浏览器缩放（Ctrl + 减号）');
}

// ==================== 画笔大小控制 ====================

const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');

if (brushSizeInput) {
    brushSizeInput.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        brushSizeValue.textContent = brushSize;
    });
}

// ==================== 颜色选择系统 ====================

colorItems.forEach(item => {
    item.addEventListener('click', () => {
        selectedColor = item.style.background;
        colorItems.forEach(c => c.style.borderColor = 'transparent');
        item.style.borderColor = '#2d3748';
        currentTool = 'brush';
        toolBtns[0].style.borderColor = 'var(--primary)';
    });
});

// ==================== 下载保存系统 ====================

function downloadImage() {
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `拼豆图纸_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // 保存到历史记录
    saveHistoryToStorage('下载图纸', canvas.toDataURL());
}

// 绑定下载按钮
document.querySelector('.btn-primary-small').addEventListener('click', downloadImage);

// ==================== 历史记录系统 ====================

function saveHistoryToStorage(action, dataUrl) {
    const histories = JSON.parse(localStorage.getItem('pixelBeadHistory') || '[]');
    
    histories.unshift({
        action: action,
        image: dataUrl,
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN')
    });
    
    // 只保留最近20条
    if (histories.length > 20) {
        histories.pop();
    }
    
    localStorage.setItem('pixelBeadHistory', JSON.stringify(histories));
}

function showHistory() {
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    
    const histories = JSON.parse(localStorage.getItem('pixelBeadHistory') || '[]');
    
    if (histories.length === 0) {
        alert('暂无历史记录');
        return;
    }
    
    // 创建历史记录弹窗
    let html = '<div style="max-height:400px;overflow-y:auto;">';
    histories.forEach((item, index) => {
        html += `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #eee;">
                <img src="${item.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                <div>
                    <div style="font-weight:600;">${item.action}</div>
                    <div style="font-size:12px;color:#666;">${item.date}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    // 显示弹窗
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal" style="max-width:500px;">
            <div class="modal-header">
                <h2>📝 历史记录</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">${html}</div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// 绑定历史记录按钮
document.querySelectorAll('.nav-btn')[1].addEventListener('click', showHistory);

// ==================== 视频教程系统 ====================

function showVideoTutorial() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal" style="max-width:600px;">
            <div class="modal-header">
                <h2>🎬 猫咪教程</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;">
                    <p style="font-size:16px;color:#666;margin-bottom:20px;">使用教程视频即将上线...</p>
                    <div style="background:#ffeaa7;border-radius:16px;padding:40px;font-size:80px;">
                        🎥🐱
                    </div>
                    <p style="margin-top:20px;color:#999;">如有疑问，请联系客服微信：kaxill</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// 绑定视频教程按钮
document.querySelectorAll('.quick-btn')[0].addEventListener('click', showVideoTutorial);

// ==================== 客服系统 ====================

function showContact() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal" style="max-width:400px;">
            <div class="modal-header">
                <h2>🐱 联系客服</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:60px;margin-bottom:20px;">💬</div>
                    <div style="background:linear-gradient(135deg,#fff8f0 0%,#ffecd2 100%);padding:20px;border-radius:16px;border:2px solid #ffeaa7;">
                        <p style="font-size:16px;margin-bottom:12px;"><strong>📱 微信：</strong>kaxill</p>
                        <p style="font-size:16px;margin-bottom:12px;"><strong>📧 邮箱：</strong>617171856@qq.com</p>
                    </div>
                    <p style="margin-top:16px;color:#666;font-size:14px;">工作时间：9:00 - 21:00</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// 绑定客服按钮
document.querySelectorAll('.nav-btn')[2].addEventListener('click', showContact);

// ==================== 导入功能 ====================

function importImage() {
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    fileInput.click();
}

document.querySelectorAll('.nav-btn')[3].addEventListener('click', importImage);

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    checkVerification();
    
    // 初始化画布为隐藏
    canvasEditor.classList.add('hidden');
    
    // 设置默认工具
    toolBtns[0].style.borderColor = 'var(--primary)';
    
    console.log('🐱 小猫拼豆生成器已加载');
});

// ==================== 触摸支持（移动端）====================

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});
