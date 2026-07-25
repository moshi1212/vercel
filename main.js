// 卡密验证弹窗控制
const licenseModal = document.getElementById('licenseModal');
const loginModal = document.getElementById('loginModal');
const getLicenseBtn = document.getElementById('getLicenseBtn');
const verifyBtn = document.getElementById('verifyBtn');

// 验证状态
let isVerified = false;

// 打开卡密弹窗
getLicenseBtn.addEventListener('click', () => {
    licenseModal.classList.add('active');
});

// 关闭卡密弹窗
function closeLicenseModal() {
    licenseModal.classList.remove('active');
}

// 打开登录弹窗
function showLogin() {
    loginModal.classList.add('active');
}

// 关闭登录弹窗
function closeLoginModal() {
    loginModal.classList.remove('active');
}

// 点击弹窗外部关闭
licenseModal.addEventListener('click', (e) => {
    if (e.target === licenseModal) {
        closeLicenseModal();
    }
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeLoginModal();
    }
});

// 验证卡密
verifyBtn.addEventListener('click', async () => {
    const phone = document.getElementById('phone').value.trim();
    const license = document.getElementById('license').value.trim();
    const message = document.getElementById('message');
    
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        showMessage('请输入正确的11位手机号', 'error');
        return;
    }
    
    // 验证卡密格式
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
            
            // 保存验证状态到本地存储
            localStorage.setItem('licenseVerified', 'true');
            localStorage.setItem('verifiedPhone', phone);
            localStorage.setItem('verifiedAt', Date.now().toString());
            
            // 2秒后关闭弹窗并启用功能
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

// 显示消息
function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
}

// 启用功能（验证通过后）
function enableFeatures() {
    // 可以在这里添加验证通过后的功能启用逻辑
    console.log('功能已启用');
    
    // 显示成功提示
    const uploadZone = document.getElementById('uploadZone');
    uploadZone.style.borderColor = '#28a745';
    uploadZone.style.background = '#f0fff4';
    
    setTimeout(() => {
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
    }, 2000);
}

// 检查是否已验证（24小时内免重复验证）
function checkVerification() {
    const verified = localStorage.getItem('licenseVerified');
    const verifiedAt = localStorage.getItem('verifiedAt');
    
    if (verified && verifiedAt) {
        const now = Date.now();
        const verifiedTime = parseInt(verifiedAt);
        const hours24 = 24 * 60 * 60 * 1000;
        
        if (now - verifiedTime < hours24) {
            isVerified = true;
            console.log('已验证，24小时内免重复验证');
            return true;
        } else {
            // 超过24小时，清除验证状态
            localStorage.removeItem('licenseVerified');
            localStorage.removeItem('verifiedPhone');
            localStorage.removeItem('verifiedAt');
        }
    }
    return false;
}

// 文件上传
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

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
    uploadZone.style.background = '#fff5f5';
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    console.log('处理文件:', file.name);
    
    // 显示画布编辑器
    document.getElementById('uploadZone').classList.add('hidden');
    document.getElementById('canvasEditor').classList.remove('hidden');
    
    // 这里可以添加图片处理逻辑
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('mainCanvas');
                const ctx = canvas.getContext('2d');
                
                // 缩放图片适应画布
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 创建空白画布
function createBlankCanvas() {
    if (!isVerified && !checkVerification()) {
        licenseModal.classList.add('active');
        return;
    }
    
    document.getElementById('uploadZone').classList.add('hidden');
    document.getElementById('canvasEditor').classList.remove('hidden');
    
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#e1e4e8';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 颜色选择
const colorItems = document.querySelectorAll('.color-item');
let selectedColor = '#ff6b6b';

colorItems.forEach(item => {
    item.addEventListener('click', () => {
        selectedColor = item.style.background;
        colorItems.forEach(c => c.style.borderColor = 'transparent');
        item.style.borderColor = '#2d3748';
    });
});

// 页面加载时检查验证状态
document.addEventListener('DOMContentLoaded', () => {
    checkVerification();
});
