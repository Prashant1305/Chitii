const { CALL_INITIATED, CALL_INCOMING } = require("../Constants/events")
const Conversation = require("../models/conversation_model")
const { getSockets } = require("./helper")
const { roomIds, activeUserSocketIDs } = require("./infoOfActiveSession")


const callingFeatures = (socket, io) => {
    socket.on(CALL_INITIATED, async (data) => { // data-{userId of person to whom we are calling}
        const chat = await Conversation.findOne({
            members: { $all: [data._id, socket.clientAuthData._id + ""] },
            group_chat: false
        }).lean()
        // console.log(socket.clientAuthData._id, data._id, chat);
        roomIds.set(chat._id, { ...chat.members })
        // console.log(roomIds)
        const userIdsForSendingIncomingCallEvent = chat.members.filter((id) => id + "" !== socket.clientAuthData._id + "")
        console.log(userIdsForSendingIncomingCallEvent);
        const userSocketIdsForSendingIncomingCallEvent = getSockets(userIdsForSendingIncomingCallEvent, activeUserSocketIDs);
        // console.log("line19", userSocketIdsForSendingIncomingCallEvent);
        if (userSocketIdsForSendingIncomingCallEvent.length > 0) {
            io.to(userSocketIdsForSendingIncomingCallEvent).emit(CALL_INCOMING, { user: { user_name: socket.clientAuthData.user_name, avatar_url: socket.clientAuthData.avatar_url }, roomId: chat._id + "" });
        }
    })
}
module.exports = { callingFeatures }