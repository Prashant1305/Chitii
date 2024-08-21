const { START_TYPING, STOP_TYPING, CHAT_JOINED, CHAT_LEFT, ONLINE_USERS } = require("../Constants/events")
const Conversation = require("../models/conversation_model")
const { activeUserSocketIDs, onlineUsersIds } = require("./infoOfActiveSession")
const { getSockets } = require("./helper")

const emitEvent = (req, event, users, data) => {
    console.log("event emitted", event)
}

const startTypingFeature = (socket, io) => {
    socket.on(START_TYPING, async (data) => {
        try {
            const { members } = await Conversation.findById(data.chatId)?.select({ members: 1 })?.lean();
            if (members.some((member) => (member.toString() === socket.clientAuthData._id.toString()))) {

                const otherMemberOfChats = members.filter((member) => (member.toString() != socket.clientAuthData._id.toString()))

                const activeChatMembersInSockets = getSockets(otherMemberOfChats, activeUserSocketIDs);

                io.to(activeChatMembersInSockets).emit(START_TYPING, { chatId: data.chatId, user: { user_name: socket.clientAuthData.user_name, _id: socket.clientAuthData._id } });
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
            const otherMemberOfChats = members.filter((member) => (member.toString() != socket.clientAuthData._id.toString()))
            // console.log("otherMemberOfChats", otherMemberOfChats);
            const activeChatMembersInSockets = getSockets(otherMemberOfChats, activeUserSocketIDs);
            // console.log("activeChatMembersInSockets", activeChatMembersInSockets);
            io.to(activeChatMembersInSockets).emit(STOP_TYPING, { chatId: data.chatId, user: { user_name: socket.clientAuthData.user_name, _id: socket.clientAuthData._id } });
        } catch (error) {
            console.log("failed to get members of chat")
        }
    })
}

const comingOnlineFeature = (socket, io) => {
    socket.on(CHAT_JOINED, async () => {
        const userId = socket.clientAuthData._id
        onlineUsersIds.add(userId.toString());

        // finding friend
        const chats = await Conversation.find({ members: userId, group_chat: false }).lean()

        const friendsIds = [];
        chats.forEach((chat) => {
            if (chat.members[0] + "" === userId + "") {
                friendsIds.push({ _id: chat.members[1] })

            } else {
                friendsIds.push({ _id: chat.members[0] })
            }
        })

        const onlineFriends = friendsIds.filter((friend) => onlineUsersIds.has(friend._id + ""))
        const friendSocketIds = getSockets([...onlineFriends, { _id: userId }], activeUserSocketIDs); // adding userId so that he can receive online users

        if (friendSocketIds.length > 0) {
            io.to(friendSocketIds).emit(ONLINE_USERS, { users: Array.from(onlineUsersIds) })
        }
    })
}

const functionCalledForGoingOffline = async (socket, io) => {
    const userId = socket.clientAuthData._id
    onlineUsersIds.delete(userId.toString());

    // finding friend
    const chats = await Conversation.find({ members: userId, group_chat: false }).lean()

    const friendsIds = [];
    chats.forEach((chat) => {
        if (chat.members[0] + "" === userId + "") {
            friendsIds.push({ _id: chat.members[1] })

        } else {
            friendsIds.push({ _id: chat.members[0] })
        }
    })

    const onlineFriends = friendsIds.filter((friend) => onlineUsersIds.has(friend._id + ""))
    const friendSocketIds = getSockets(onlineFriends, activeUserSocketIDs);

    if (friendSocketIds.length > 0) {
        io.to(friendSocketIds).emit(ONLINE_USERS, { users: Array.from(onlineUsersIds) })
    }
}

const goingOfflineFeature = (socket, io) => {
    socket.on(CHAT_LEFT, async () => {

        await functionCalledForGoingOffline(socket, io)
    })
}

module.exports = { emitEvent, startTypingFeature, stopTypingFeature, comingOnlineFeature, goingOfflineFeature, functionCalledForGoingOffline };