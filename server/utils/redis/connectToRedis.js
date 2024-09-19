const Redis = require("ioredis");
const { ONLINE_USERS, START_TYPING, STOP_TYPING, NEW_MESSAGE, REFETCH_CHATS } = require("../../Constants/events");
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

    const channels = ["MESSAGES", ONLINE_USERS, START_TYPING, STOP_TYPING, NEW_MESSAGE, REFETCH_CHATS];
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
        let membersSocket;
        const io = getIo()
        switch (channel) {

            case ONLINE_USERS:

                const modifiedOnlineFriendIds = data?.onlineFriendIds.map((friend) => ({ _id: friend }))

                membersSocket = getSockets(modifiedOnlineFriendIds, InstanceActiveUserSocketIDs); // adding userId so that he can receive online users

                if (membersSocket.length > 0) {
                    const allOnlineMembersOfAllInstance = await redis.smembers("onlineUsersMongoIds");

                    io.to(membersSocket).emit(ONLINE_USERS, { users: Array.from(allOnlineMembersOfAllInstance) })
                }
                break;

            case START_TYPING:

                const modifiedOtherMemberOfChats = data.otherMemberOfChats.map((id) => ({ _id: id }))
                membersSocket = getSockets(modifiedOtherMemberOfChats, InstanceActiveUserSocketIDs);
                if (membersSocket.length > 0) {
                    io.to(membersSocket).emit(START_TYPING, { chatId: data.chatId, user: data.user });
                }
                break;

            case STOP_TYPING:

                const modifiedOtherMemberOfChatsForStopTyping = data.otherMemberOfChats.map((id) => ({ _id: id }))
                membersSocket = getSockets(modifiedOtherMemberOfChatsForStopTyping, InstanceActiveUserSocketIDs);
                if (membersSocket.length > 0) {
                    io.to(membersSocket).emit(STOP_TYPING, { chatId: data.chatId, user: data.user });
                }
                break;

            case REFETCH_CHATS:

                const modifiedMemberOfRefetchChat = data.members.map((id) => ({ _id: id }))
                membersSocket = getSockets(modifiedMemberOfRefetchChat, InstanceActiveUserSocketIDs);
                if (membersSocket.length > 0) {
                    io.to(membersSocket).emit(REFETCH_CHATS, {});
                }
                break;

            case NEW_MESSAGE:

                const modifiedMemberOfNewMessage = data.members.map((id) => ({ _id: id }));
                membersSocket = getSockets(modifiedMemberOfNewMessage, InstanceActiveUserSocketIDs);
                if (membersSocket.length > 0) {
                    io.to(membersSocket).emit(NEW_MESSAGE, data.messageNotification);
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