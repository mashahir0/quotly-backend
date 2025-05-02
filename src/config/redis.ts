




import { createClient } from "redis";

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT) || 6379,
      }});

redisClient.on("error", (err) => console.error("Redis error:", err));

redisClient.connect().catch(console.error);


export default redisClient;
