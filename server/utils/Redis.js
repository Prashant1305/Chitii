const Redis = require("ioredis");

const userCredentials = {
    password: process.env.REDIS_PASSWORD,
    username: "default",
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}

let pub, sub;
const initializeRedis = () => {
    const channels = ["MESSAGES", "EVENTLISTENER", "EVENTEMITTER"];
    pub = new Redis(userCredentials);
    sub = new Redis(userCredentials);

    // Subscribe to multiple channels
    sub.subscribe(...channels, (err, count) => {
        if (err) {
            console.error("Failed to subscribe: ", err);
        } else {
            console.log(`Subscribed to ${count} channels.`);
        }
    });
    sub.on('message', (channel, message) => {
        console.log("from redis.js", { channel, message })

    })
}




module.exports = { pub, sub, initializeRedis }