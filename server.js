require('dotenv').config();
const express = require('express');
//const pinecone = require('./pineconeClient');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const cors = require('cors'); 


const app = express();
const PORT = process.env.PORT || 5001;


// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000' // Replace with your frontend URL
}));

// Create Redis client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  redisClient.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
// Middleware to parse JSON
app.use(express.json());

// Session configuration
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key', // Replace with a secure, random string in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use((req, res, next) => {
    try {
      // Try converting the session to a JSON string to check serializability
      JSON.stringify(req.session);
      console.log('Session is serializable:', req.session);
    } catch (error) {
      console.error('Session data is not serializable:', error);
    }
    next();
  });
  

// Middleware to log session details
// app.use((req, res, next) => {
//     //console.log('Session ID:', req.sessionID);
//     console.log('Session Data:', req.session);
//     next();
// })

// Import and use API routes
const apiRoutes = require('./routes/apiRoutes.mjs').default;
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
