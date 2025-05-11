const Redis = require("ioredis");
const { ONLINE_USERS, START_TYPING, STOP_TYPING, NEW_MESSAGE, REFETCH_CHATS, NEW_REQUEST, CALL_INCOMING, CALL_INCOMING_RESPONSE, INITIATE_P2P, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_ANSWERE, PEER_NEGO_NEEDED, PEER_NEGO_DONE, END_CALL } = require("../../Constants/events");

const userCredentials = {
    password: process.env.REDIS_PASSWORD,
    username: "default",
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}

const redis = new Redis(userCredentials); // connection in regular mode for normal operation
const sub = new Redis(userCredentials); // connection in subscriber mode for subscribing only
const pub = new Redis(userCredentials); // connection in publisher mode for publishing only
const initializeRedis = () => {
    redis.sadd(`onlineSocketServers`, process.env.PORT)

    const channels = ["MESSAGES", ONLINE_USERS, START_TYPING, STOP_TYPING, NEW_MESSAGE, REFETCH_CHATS, NEW_REQUEST, CALL_INCOMING, INITIATE_P2P, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_ANSWERE, PEER_NEGO_NEEDED, PEER_NEGO_DONE, END_CALL];
    // Subscribe to multiple channels
    // sub.subscribe(channels, (err, count) => {
    //     if (err) {
    //         console.error("Failed to subscribe: ", err);
    //     } else {
    //         console.log(`Subscribed to ${count} channels.`);
    //     }
    // });

    // sub.on("message", async (channel, message) => {
    //     const data = JSON.parse(message)
    //     console.log("received from subcription on redis", data)

    // })

    // Handle errors
    redis.on('error', (err) => {
        console.error("From Redis side error:", err);
    });
}

module.exports = { redis, initializeRedis, sub, pub }