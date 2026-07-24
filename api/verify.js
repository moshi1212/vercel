// 卡密验证 API
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
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const { key, type } = req.body;
    
    if (!key) {
      return res.status(400).json({ success: false, message: '请输入卡密或手机号' });
    }
    
    // 手机号验证 - 直接通过（格式已在前端校验）
    if (type === 'phone') {
      return res.json({
        success: true,
        message: '验证成功',
        duration: 24 * 60 * 60 * 1000, // 24小时
        type: 'phone'
      });
    }
    
    // 卡密验证
    const keyData = await redis.get(`key:${key}`);
    
    if (!keyData) {
      return res.json({ success: false, message: '卡密不存在或已过期' });
    }
    
    const keyInfo = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
    
    // 检查是否已使用
    if (keyInfo.status === 'used') {
      return res.json({ success: false, message: '该卡密已被使用' });
    }
    
    // 检查是否已过期
    if (keyInfo.expiresAt && Date.now() > keyInfo.expiresAt) {
      return res.json({ success: false, message: '卡密已过期' });
    }
    
    // 验证成功 - 返回有效期
    const duration = keyInfo.duration || 30 * 24 * 60 * 60 * 1000; // 默认30天
    
    return res.json({
      success: true,
      message: '验证成功',
      duration: duration,
      type: 'key'
    });
    
  } catch (error) {
    console.error('验证失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}
