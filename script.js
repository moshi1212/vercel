// ==================== 配置 ====================
const API_BASE = '/api';
const VERIFIED_KEY = 'pixelbeads_verified';
const VERIFIED_UNTIL_KEY = 'pixelbeads_verified_until';

// ==================== 状态管理 ====================
let isVerified = false;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    checkVerificationStatus();
    setupEventListeners();
});

// ==================== 验证状态检查 ====================
function checkVerificationStatus() {
    const verified = localStorage.getItem(VERIFIED_KEY);
    const verifiedUntil = localStorage.getItem(VERIFIED_UNTIL_KEY);
    
    if (verified && verifiedUntil) {
        const now = Date.now();
        const until = parseInt(verifiedUntil);
        
        if (now < until) {
            isVerified = true;
            updateUIForVerified();
        } else {
            // 验证已过期
            clearVerification();
        }
    }
}

function updateUIForVerified() {
    // 已验证用户显示状态
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div class="upload-content">
                <span style="font-size: 48px;">✅</span>
                <p class="upload-text">已验证，可以开始使用</p>
                <p class="upload-hint">点击或拖拽上传图片生成拼豆图纸</p>
                <input type="file" id="fileInput" accept="image/*,.csv" hidden>
            </div>
        `;
    }
}

function clearVerification() {
    localStorage.removeItem(VERIFIED_KEY);
    localStorage.removeItem(VERIFIED_UNTIL_KEY);
    isVerified = false;
}

// ==================== 事件监听 ====================
function setupEventListeners() {
    // 上传区域点击
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', (e) => {
            if (!isVerified) {
                showVerifyModal();
                return;
            }
            fileInput?.click();
        });
    }
    
    // 文件选择
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // 拖拽上传
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#1890ff';
            uploadArea.style.background = '#f0f7ff';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#d9d9d9';
            uploadArea.style.background = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#d9d9d9';
            uploadArea.style.background = 'transparent';
            
            if (!isVerified) {
                showVerifyModal();
                return;
            }
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
    }
    
    // 输入框回车验证
    const keyInput = document.getElementById('keyInput');
    if (keyInput) {
        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyKey();
            }
        });
    }
}

// ==================== 弹窗控制 ====================
function showVerifyModal() {
    document.getElementById('verifyModal')?.classList.add('active');
    document.getElementById('keyInput')?.focus();
}

function closeVerifyModal() {
    document.getElementById('verifyModal')?.classList.remove('active');
}

function showGetKeyModal() {
    closeVerifyModal();
    document.getElementById('getKeyModal')?.classList.add('active');
}

function closeGetKeyModal() {
    document.getElementById('getKeyModal')?.classList.remove('active');
}

function showLogin() {
    showToast('登录功能开发中...');
}

function showVideoTutorial() {
    showToast('视频教程即将上线');
}

function showDownloadModal() {
    showToast('客户端下载即将开放');
}

// ==================== 卡密验证 ====================
async function verifyKey() {
    const input = document.getElementById('keyInput');
    const value = input?.value?.trim();
    
    if (!value) {
        showToast('请输入卡密或手机号');
        return;
    }
    
    // 验证格式：10位卡密 或 11位手机号
    const isKey = /^[A-Za-z0-9]{10}$/.test(value);
    const isPhone = /^1[3-9]\d{9}$/.test(value);
    
    if (!isKey && !isPhone) {
        showToast('格式错误：请输入10位卡密或11位手机号');
        return;
    }
    
    try {
        showToast('正在验证...');
        
        const response = await fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                key: value,
                type: isKey ? 'key' : 'phone'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 验证成功
            const duration = result.duration || 24 * 60 * 60 * 1000; // 默认24小时
            localStorage.setItem(VERIFIED_KEY, value);
            localStorage.setItem(VERIFIED_UNTIL_KEY, String(Date.now() + duration));
            
            isVerified = true;
            closeVerifyModal();
            updateUIForVerified();
            showToast('验证成功！可以开始使用了');
            
            // 标记卡密为已使用
            if (isKey) {
                await markKeyAsUsed(value);
            }
        } else {
            showToast(result.message || '验证失败，请检查卡密或联系客服');
        }
    } catch (error) {
        console.error('验证失败:', error);
        showToast('网络错误，请稍后重试');
    }
}

async function markKeyAsUsed(key) {
    try {
        await fetch(`${API_BASE}/use-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
    } catch (error) {
        console.error('标记使用失败:', error);
    }
}

// ==================== 文件上传 ====================
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.csv')) {
        showToast('仅支持 JPG、PNG 图片或 CSV 文件');
        return;
    }
    
    showToast('正在处理图片...');
    
    // 模拟处理
    setTimeout(() => {
        showToast('图片处理完成！（演示模式）');
    }, 1500);
}

// ==================== 提示消息 ====================
function showToast(message) {
    const toast = document.getElementById('toastModal');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toastMessage) {
        toastMessage.textContent = message;
    }
    
    toast?.classList.add('active');
    
    setTimeout(() => {
        toast?.classList.remove('active');
    }, 2500);
}

// ==================== 导出函数供HTML调用 ====================
window.showVerifyModal = showVerifyModal;
window.closeVerifyModal = closeVerifyModal;
window.showGetKeyModal = showGetKeyModal;
window.closeGetKeyModal = closeGetKeyModal;
window.verifyKey = verifyKey;
window.showLogin = showLogin;
window.showVideoTutorial = showVideoTutorial;
window.showDownloadModal = showDownloadModal;
