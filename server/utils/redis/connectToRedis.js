const Redis = require("ioredis");
const { ONLINE_USERS, START_TYPING, STOP_TYPING } = require("../../Constants/events");
const { getSockets } = require("../helper");
const { InstanceActiveUserSocketIDs, InstanceOnlineUsersIds } = require("../infoOfActiveSession");
const { getIo } = require("../socket/io");

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

    const channels = ["MESSAGES", ONLINE_USERS, START_TYPING, STOP_TYPING];
    // Subscribe to multiple channels
    sub.subscribe(channels, (err, count) => {
        if (err) {
            console.error("Failed to subscribe: ", err);
        } else {
            console.log(`Subscribed to ${count} channels.`);
        }
    });

    sub.on("message", async (channel, message) => {
        const data = JSON.parse(message)
        const io = getIo()
        switch (channel) {

            case ONLINE_USERS:

                const modifiedOnlineFriendIds = data?.onlineFriendIds.map((friend) => ({ _id: friend }))

                const instanceFriendSocketIds = getSockets(modifiedOnlineFriendIds, InstanceActiveUserSocketIDs); // adding userId so that he can receive online users

                if (instanceFriendSocketIds.length > 0) {
                    const allOnlineMembersOfAllInstance = await redis.smembers("onlineUsersMongoIds");

                    io.to(instanceFriendSocketIds).emit(ONLINE_USERS, { users: Array.from(allOnlineMembersOfAllInstance) })
                }
                break;

            case START_TYPING:

                const modifiedOtherMemberOfChats = data.otherMemberOfChats.map((id) => ({ _id: id }))
                const activeChatMembersSocketIdsForStartTyping = getSockets(modifiedOtherMemberOfChats, InstanceActiveUserSocketIDs);
                if (activeChatMembersSocketIdsForStartTyping.length > 0) {
                    io.to(activeChatMembersSocketIdsForStartTyping).emit(START_TYPING, { chatId: data.chatId, user: data.user });
                }
                break;

            case STOP_TYPING:

                const modifiedOtherMemberOfChatsForStopTyping = data.otherMemberOfChats.map((id) => ({ _id: id }))
                const activeChatMembersSocketIdssForStopTyping = getSockets(modifiedOtherMemberOfChatsForStopTyping, InstanceActiveUserSocketIDs);
                // console.log("activeChatMembersSocketIdssForStopTyping", activeChatMembersSocketIdssForStopTyping);
                if (activeChatMembersSocketIdssForStopTyping.length > 0) {
                    io.to(activeChatMembersSocketIdssForStopTyping).emit(STOP_TYPING, { chatId: data.chatId, user: data.user });
                }
                break;

            default:
                console.log("from redis.js", { channel, message })
                break;
        }

    })

    // Handle errors
    redis.on('error', (err) => {
        console.error("From Redis side error:", err);
    });
}




module.exports = { redis, initializeRedis, sub, pub }