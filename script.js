// 卡密验证系统前端脚本

const API_BASE = '/api';

// DOM 元素
const phoneInput = document.getElementById('phone');
const licenseInput = document.getElementById('license');
const verifyBtn = document.getElementById('verifyBtn');
const contactBtn = document.getElementById('contactBtn');
const messageDiv = document.getElementById('message');

// 验证手机号格式
function isValidPhone(phone) {
    return /^1\d{10}$/.test(phone);
}

// 验证卡密格式（10位字母数字）
function isValidLicense(key) {
    return /^[A-Za-z0-9]{10}$/.test(key);
}

// 显示消息
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// 检查本地存储的验证状态
function checkLocalAuth() {
    const auth = localStorage.getItem('license_auth');
    if (auth) {
        const data = JSON.parse(auth);
        const now = Date.now();
        // 24小时内有效
        if (now - data.timestamp < 24 * 60 * 60 * 1000) {
            return true;
        }
        localStorage.removeItem('license_auth');
    }
    return false;
}

// 验证卡密
async function verifyLicense() {
    const phone = phoneInput.value.trim();
    const license = licenseInput.value.trim().toUpperCase();

    // 验证输入
    if (!isValidPhone(phone)) {
        showMessage('请输入正确的11位手机号', 'error');
        return;
    }

    if (!isValidLicense(license)) {
        showMessage('请输入正确的10位卡密', 'error');
        return;
    }

    // 检查本地是否已验证
    if (checkLocalAuth()) {
        showMessage('您已通过验证（24小时内有效）', 'success');
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = '验证中...';

    try {
        const response = await fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, license })
        });

        const data = await response.json();

        if (data.success) {
            // 保存验证状态到本地
            localStorage.setItem('license_auth', JSON.stringify({
                phone,
                license,
                timestamp: Date.now()
            }));
            showMessage('✅ 验证成功！24小时内无需重复验证', 'success');
            phoneInput.value = '';
            licenseInput.value = '';
        } else {
            showMessage(data.message || '验证失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = '验证卡密';
    }
}

// 联系客服
function contactSupport() {
    alert('请添加客服微信：客服微信号\n或发送邮件至：support@example.com');
}

// 事件监听
verifyBtn.addEventListener('click', verifyLicense);
contactBtn.addEventListener('click', contactSupport);

// 回车键提交
licenseInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyLicense();
});

// 页面加载时检查验证状态
document.addEventListener('DOMContentLoaded', () => {
    if (checkLocalAuth()) {
        showMessage('您已通过验证（24小时内有效）', 'success');
    }
});