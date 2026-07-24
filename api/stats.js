// 获取卡密统计
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // 扫描所有卡密
    // 注意：Upstash Redis 不支持 KEYS 命令，这里简化处理
    // 实际生产环境建议用不同的数据结构
    
    // 由于 Upstash 限制，这里返回模拟数据
    // 你可以通过其他方式维护统计信息
    
    return res.json({
      total: 0,
      used: 0,
      available: 0,
      note: '统计功能需要额外实现，建议通过维护计数器来跟踪'
    });
    
  } catch (error) {
    console.error('获取统计失败:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
