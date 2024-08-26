const { CALL_INCOMING } = require("../Constants/events");
const Conversation = require("../models/conversation_model");
const { getSockets } = require("../utils/helper");
const { roomIds, onlineUsersIds, activeUserSocketIDs } = require("../utils/infoOfActiveSession");

const incomingCall = async (req, res, next) => {
    try {
        const { receiverClientId } = req.body;
        const chat = await Conversation.findOne({
            members: { $all: [receiverClientId, req.clientAuthData._id + ""] },
            group_chat: false
        }).lean()

        if (!chat) {
            return res.status(404).send({ message: "No conversation found" });
        }

        // checking wether user is online or not
        let receiverUserIsOnline = false;
        onlineUsersIds.forEach((value) => {
            if (value === receiverClientId) {
                receiverUserIsOnline = true;
            }
        })
        if (!receiverUserIsOnline) {
            return res.status(203).send({ message: "User is offline" });
        }

        // checking for user is on call or not
        roomIds.forEach((value, key) => {
            if (value.length > 0) {
                if (value.some((memberId) => memberId + "" === receiverClientId + "")) {
                    return res.status(203).json({ message: "user is on call" })
                }
            }
        })
        roomIds.set(chat._id, { ...chat.members });

        const userIdsForSendingIncomingCallEvent = chat.members.filter((id) => id + "" !== req.clientAuthData._id + "")

        const userSocketIdsForSendingIncomingCallEvent = getSockets(userIdsForSendingIncomingCallEvent, activeUserSocketIDs);

        if (userSocketIdsForSendingIncomingCallEvent.length > 0) {
            const io = req.app.get('socketio'); // Retrieve io instance from app
            io.to(userSocketIdsForSendingIncomingCallEvent).emit(CALL_INCOMING, { user: { _id: req.clientAuthData._id, user_name: req.clientAuthData.user_name, avatar_url: req.clientAuthData.avatar_url }, roomId: chat._id + "" });
        }

        res.status(200).json({ message: "ringing..." })
    } catch (error) {
        const err = new Error("calling failed, plz try later");
        err.status = 500;
        err.extraDetails = "from incoming function inside calling_controller";
        next(err);
    }
}
module.exports = { incomingCall }