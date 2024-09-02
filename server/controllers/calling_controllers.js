const { CALL_INCOMING, CALL_RECEIVED_RESPONSE, INITIATE_P2P } = require("../Constants/events");
const Conversation = require("../models/conversation_model");
const { getSockets } = require("../utils/helper");
const { roomIds, onlineUsersIds, activeUserSocketIDs } = require("../utils/infoOfActiveSession");

const EventEmitter = require('events');

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

        const io = req.app.get('socketio'); // Retrieve io instance from app

        if (userSocketIdsForSendingIncomingCallEvent.length > 0) {
            io.to(userSocketIdsForSendingIncomingCallEvent).emit(CALL_INCOMING, { user: { _id: req.clientAuthData._id, user_name: req.clientAuthData.user_name, avatar_url: req.clientAuthData.avatar_url }, roomId: chat._id + "" });
        }
        const timeId = setTimeout(() => {
            return res.status(200).json({ message: "call unanswered..." })
        }, 8000);

        /* ********* // Access a specific socket by its ID */
        const specificIncomingCallReceiverSocket = io.sockets.sockets.get(userSocketIdsForSendingIncomingCallEvent[0])
        let responseOfReceiverPromise = () =>
        (new Promise((resolve, reject) => {
            specificIncomingCallReceiverSocket.once(CALL_RECEIVED_RESPONSE, (data) => { // once means it will trigger only once
                if (data.status === "ACCEPTED") {
                    resolve(data);
                }
                else { // data.status === "DECLINED"
                    reject(data);
                }
            });
        })
        )

        try {
            const recivedCallResponse = await responseOfReceiverPromise();
            const callerUserSocketId = getSockets([{ _id: req.clientAuthData._id }], activeUserSocketIDs)
            io.to(callerUserSocketId).emit(INITIATE_P2P, { socketId: userSocketIdsForSendingIncomingCallEvent[0] });
            return res.status(200).json({ message: "call Accepted" })
        } catch (error) {
            return res.status(203).json({ message: "call Rejected" });
        } finally {
            clearTimeout(timeId);
        }

    } catch (error) {
        const err = new Error("calling failed, plz try later");
        err.status = 500;
        err.extraDetails = "from incoming function inside calling_controller";
        next(err);
    }
}
module.exports = { incomingCall }