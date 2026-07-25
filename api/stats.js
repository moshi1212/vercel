// 获取统计信息 API
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
    // 获取所有卡密
    const keys = await redis.keys('key:*');
    let total = 0;
    let used = 0;
    let active = 0;

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        total++;
        const info = typeof data === 'string' ? JSON.parse(data) : data;
        if (info.used) {
          used++;
        } else {
          active++;
        }
      }
    }

    // 获取今日验证数
    const today = new Date().toISOString().split('T')[0];
    const logs = await redis.lrange('verification_logs', 0, -1);
    let todayCount = 0;

    for (const log of logs) {
      const entry = typeof log === 'string' ? JSON.parse(log) : log;
      if (entry.timestamp && entry.timestamp.startsWith(today)) {
        todayCount++;
      }
    }

    return res.status(200).json({
      success: true,
      total,
      used,
      active,
      today: todayCount
    });

  } catch (error) {
    console.error('获取统计错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}