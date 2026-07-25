// 验证卡密 API
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { phone, license } = req.body;

    // 验证输入
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式错误' });
    }

    if (!license || !/^[A-Za-z0-9]{10}$/.test(license)) {
      return res.status(400).json({ success: false, message: '卡密格式错误' });
    }

    const key = license.toUpperCase();

    // 检查卡密是否存在
    const keyData = await redis.get(`key:${key}`);
    
    if (!keyData) {
      return res.status(400).json({ success: false, message: '卡密不存在' });
    }

    const keyInfo = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;

    // 检查卡密是否已使用
    if (keyInfo.used) {
      return res.status(400).json({ success: false, message: '卡密已被使用' });
    }

    // 标记卡密为已使用
    keyInfo.used = true;
    keyInfo.usedBy = phone;
    keyInfo.usedAt = new Date().toISOString();
    
    await redis.set(`key:${key}`, JSON.stringify(keyInfo));

    // 记录验证日志
    const logEntry = {
      phone,
      license: key,
      timestamp: new Date().toISOString()
    };
    await redis.lpush('verification_logs', JSON.stringify(logEntry));

    return res.status(200).json({ 
      success: true, 
      message: '验证成功',
      data: { phone, verifiedAt: keyInfo.usedAt }
    });

  } catch (error) {
    console.error('验证错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}