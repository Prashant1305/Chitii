const { START_TYPING, STOP_TYPING, CHAT_JOINED, CHAT_LEFT, ONLINE_USERS, UPDATE_ONLINE_STATUS } = require("../Constants/events")
const Conversation = require("../models/conversation_model")
const { InstanceActiveUserSocketIDs, InstanceOnlineUsersIds } = require("./infoOfActiveSession")
const { getSockets, findUserConnectedToAndSendSocketEventToRabbit } = require("./helper")
const { redis, pub } = require("./redis/connectToRedis")


const startTypingFeature = (socket, io) => {
    socket.on(START_TYPING, async (data) => {
        try {
            const { members } = await Conversation.findById(data.chatId)?.select({ members: 1 })?.lean();
            const membersExceptMe = members.filter((member) => member + "" !== socket.clientAuthData._id + "");

            await findUserConnectedToAndSendSocketEventToRabbit(membersExceptMe, { chatId: data.chatId, user: socket.clientAuthData, event_name: START_TYPING }, false)
        } catch (error) {
            console.log("failed to get members of chat")
            console.error(error);
        }
    })
}

const stopTypingFeature = (socket, io) => {
    socket.on(STOP_TYPING, async (data) => {

        try {
            const { members } = await Conversation.findById(data.chatId)?.select({ members: 1 })?.lean();
            const membersExceptMe = members.filter((member) => member + "" !== socket.clientAuthData._id + "");

            await findUserConnectedToAndSendSocketEventToRabbit(membersExceptMe, {
                chatId: data.chatId,
                user: socket.clientAuthData,
                event_name: STOP_TYPING
            }, false)
        } catch (error) {
            console.log("failed to get members of chat")
        }
    })
}

const notifyFriendsOfOnlineStatus = (socket, io) => {
    socket.on(UPDATE_ONLINE_STATUS, async (data) => {
        try {
            // finding friend of new user joined
            const friendsIds = socket.clientAuthData.friends.map((friend) => friend + "");
            if (socket.clientAuthData.preferred_online_status === "ONLINE") {
                await findUserConnectedToAndSendSocketEventToRabbit(friendsIds, {
                    user: socket.clientAuthData,
                    user_online_status: data.user_online_status,
                    event_name: UPDATE_ONLINE_STATUS
                }, false);
            } else {
                await findUserConnectedToAndSendSocketEventToRabbit(friendsIds, {
                    user: socket.clientAuthData,
                    user_online_status: "OFFLINE",
                    event_name: UPDATE_ONLINE_STATUS
                }, false);
            }


        } catch (error) {
            console.log(error)
        }
    })
}


module.exports = { startTypingFeature, stopTypingFeature, notifyFriendsOfOnlineStatus };