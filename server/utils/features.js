const { START_TYPING, STOP_TYPING } = require("../Constants/events")
const Conversation = require("../models/conversation_model")
const { activeUserSocketIDs } = require("./activeUsersInSockets")
const { getSockets } = require("./helper")

const emitEvent = (req, event, users, data) => {
    console.log("event emitted", event)
}

const startTypingFeature = (socket, io) => {
    socket.on(START_TYPING, async (data) => {

        console.log("startTyping", data)
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

        console.log("stopTyping", data)
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

module.exports = { emitEvent, startTypingFeature, stopTypingFeature };