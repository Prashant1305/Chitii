const { START_TYPING, STOP_TYPING, CHAT_JOINED, CHAT_LEFT, ONLINE_USERS } = require("../Constants/events")
const Conversation = require("../models/conversation_model")

const { getSockets } = require("./helper")
const { redis, pub } = require("./redis/connectToRedis")


const startTypingFeature = (socket, io) => {
    socket.on(START_TYPING, async (data) => {
        try {
            const { members } = await Conversation.findById(data.chatId)?.select({ members: 1 })?.lean();
            if (members.some((member) => (member.toString() === socket.clientAuthData._id.toString()))) {

                const otherMemberOfChats = members.filter((member) => (member.toString() !== socket.clientAuthData._id.toString()))
                pub.publish(START_TYPING, JSON.stringify({
                    otherMemberOfChats,
                    chatId: data.chatId,
                    user: { user_name: socket.clientAuthData.user_name, _id: socket.clientAuthData._id }
                }))
            }
            else {
                console.log(`user ${socket.clientAuthData.user_name} is not a member of the chat`)
                return;
            }
        } catch (error) {
            console.log("failed to get members of chat")
        }
    })
}

const stopTypingFeature = (socket, io) => {
    socket.on(STOP_TYPING, async (data) => {

        try {
            const { members } = await Conversation.findById(data.chatId)?.select({ members: 1 })?.lean();
            const otherMemberOfChats = members.filter((member) => (member.toString() !== socket.clientAuthData._id.toString()))

            pub.publish(STOP_TYPING, JSON.stringify({
                otherMemberOfChats,
                chatId: data.chatId,
                user: { user_name: socket.clientAuthData.user_name, _id: socket.clientAuthData._id }
            }))
        } catch (error) {
            console.log("failed to get members of chat")
        }
    })
}

const comingOnlineFeature = (socket, io) => {
    socket.on(CHAT_JOINED, async () => {
        try {
            const userId = socket.clientAuthData._id
            // InstanceOnlineUsersIds.add(userId.toString());

            // Add members in set in redis
            redis.sadd("onlineUsersMongoIds", userId.toString()).then().catch((err) => {
                console.log("error in redis from comingOnlineFeatures", err)
            })

            // finding friend of new user joined
            const chats = await Conversation.find({ members: userId, group_chat: false }).lean()

            let friendsIds = [];
            const valuesToCheck = [];
            chats.forEach((chat) => {
                if (chat.members[0] + "" === userId + "") {
                    friendsIds.push(chat.members[1] + "")
                } else {
                    friendsIds.push(chat.members[0] + "")
                }
            })

            if (friendsIds.length > 0) {
                // checking online friends in friendIds
                const onlineFriendsResponseArray = await redis.smismember("onlineUsersMongoIds", friendsIds)
                const onlineFriendIds = [...friendsIds.filter((_, index) => {
                    return onlineFriendsResponseArray[index];
                }), userId] //adding userId, so that he receives also recives online Ids

                pub.publish(ONLINE_USERS, JSON.stringify({ onlineFriendIds }), () => {
                    // console.log('Publisheing done')
                })
            }


        } catch (error) {
            console.log(error)
        }
    })
}

const functionCalledForGoingOffline = async (socket, io) => {

    const userId = socket.clientAuthData._id;

    // remove members from set in redis
    redis.srem("onlineUsersMongoIds", userId.toString()).then().catch((err) => {
        console.log("error in redis from functionCalledForGoingOffline", err)
    })

    // finding friend
    const chats = await Conversation.find({ members: userId, group_chat: false }).lean()

    const friendsIds = [];
    chats.forEach((chat) => {
        if (chat.members[0] + "" === userId + "") {
            // friendsIds.push({ _id: chat.members[1] })
            friendsIds.push(chat.members[1] + "")

        } else {
            // friendsIds.push({ _id: chat.members[0] })
            friendsIds.push(chat.members[0] + "")
        }
    })


    if (friendsIds.length > 0) {
        // checking online friends in friendIds
        const onlineFriendsResponseArray = await redis.smismember("onlineUsersMongoIds", friendsIds)

        const onlineFriendIds = friendsIds.filter((_, index) => {
            return onlineFriendsResponseArray[index];
        })

        pub.publish(ONLINE_USERS, JSON.stringify({ onlineFriendIds }), () => {
            // console.log('Publisheing done')
        })
    }
}

const goingOfflineFeature = (socket, io) => {
    socket.on(CHAT_LEFT, async () => {

        await functionCalledForGoingOffline(socket, io)
    })
}

module.exports = { startTypingFeature, stopTypingFeature, comingOnlineFeature, goingOfflineFeature, functionCalledForGoingOffline };