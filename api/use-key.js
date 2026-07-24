// 标记卡密为已使用
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
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
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'Missing key' });
    }
    
    const keyData = await redis.get(`key:${key}`);
    
    if (!keyData) {
      return res.status(404).json({ success: false, message: 'Key not found' });
    }
    
    const keyInfo = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
    
    // 标记为已使用
    keyInfo.status = 'used';
    keyInfo.usedAt = Date.now();
    
    await redis.set(`key:${key}`, JSON.stringify(keyInfo));
    
    return res.json({ success: true, message: 'Key marked as used' });
    
  } catch (error) {
    console.error('标记失败:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
