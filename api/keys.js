// 获取卡密列表 API
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const keyNames = await redis.keys('key:*');
    const keys = [];

    for (const keyName of keyNames) {
      const data = await redis.get(keyName);
      if (data) {
        const info = typeof data === 'string' ? JSON.parse(data) : data;
        keys.push(info);
      }
    }

    // 按创建时间排序，最新的在前
    keys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      keys
    });

  } catch (error) {
    console.error('获取卡密列表错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}