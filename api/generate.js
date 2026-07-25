// 生成卡密 API
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// 生成随机卡密
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req, res) {
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
    const { count = 10 } = req.body;
    const numKeys = Math.min(Math.max(parseInt(count) || 10, 1), 100);

    const generatedKeys = [];

    for (let i = 0; i < numKeys; i++) {
      let key;
      let exists = true;

      // 确保卡密唯一
      while (exists) {
        key = generateKey();
        const existing = await redis.get(`key:${key}`);
        if (!existing) {
          exists = false;
        }
      }

      const keyData = {
        code: key,
        used: false,
        createdAt: new Date().toISOString()
      };

      await redis.set(`key:${key}`, JSON.stringify(keyData));
      generatedKeys.push(keyData);
    }

    return res.status(200).json({
      success: true,
      keys: generatedKeys,
      count: generatedKeys.length
    });

  } catch (error) {
    console.error('生成卡密错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}