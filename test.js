const { createClient } = require('redis');

const redisClient = createClient({
  legacyMode: true,
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.connect().then(() => {
  console.log('Connected to Redis successfully');
  redisClient.quit();
});

