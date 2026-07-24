// 批量创建卡密
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
    const { keys, duration } = req.body;
    
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid keys' });
    }
    
    const createdAt = Date.now();
    const expiresAt = duration > 0 ? createdAt + duration : null;
    
    // 批量保存卡密
    const promises = keys.map(key => {
      const keyData = {
        key,
        status: 'active',
        createdAt,
        expiresAt,
        duration,
        usedAt: null,
        usedBy: null
      };
      return redis.set(`key:${key}`, JSON.stringify(keyData));
    });
    
    await Promise.all(promises);
    
    return res.json({ 
      success: true, 
      message: `Created ${keys.length} keys`,
      count: keys.length 
    });
    
  } catch (error) {
    console.error('创建卡密失败:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
