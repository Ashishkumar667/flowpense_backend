import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: retries => {
      console.warn(`Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 3000); 
    },
    tls: process.env.REDIS_URL?.startsWith('rediss://') 
  }
});

redisClient.on('connect', () => console.log(' Connected to Redis'));
redisClient.on('error', err => console.error('Redis Client Error', err));

await redisClient.connect();

export default redisClient;

// import { createClient } from 'redis';

// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379',
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// await redisClient.connect();
// console.log("Redis connected successfully");

// export default redisClient;