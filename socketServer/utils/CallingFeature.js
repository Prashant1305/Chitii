
const { SEND_ME_YOUR_STREAM } = require("../../client/src/components/constants/events")
const { TIME_TO_WAIT_FOR_CALL_ANSWER } = require("../Constants/constants")
const { CLIENT_CREATE_OFFER, HANDLE_OFFER_CREATE_ANSWERE, INITIAL_ANSWER, HANDLE_ANSWERE, RENEGOTIATE_OFFER, RENEGOTIATE_ANSWER, PEER_NEGO_FINAL, END_CALL, REQUEST_CALL, INITIATE_P2P, CALL_INCOMING, RINGING, CALL_INCOMING_RESPONSE, INITIAL_OFFER } = require("../Constants/events")
const Conversation = require("../models/conversation_model")
const Room = require("../models/room")
const { findUserConnectedToAndSendSocketEventToRabbit } = require("./helper")
const { pub, redis } = require("./redis/connectToRedis")

let timeId;

const callingFeatures = (socket, io) => {
    socket.on(REQUEST_CALL, async ({ to }) => {
        console.log({ to })
        let chat = await Conversation.findOne({
            members: { $all: [to, socket.clientAuthData._id + ""] },
            conversation_type: "private"
        }).lean()
        if (!chat) {
            chat = await Conversation.findById(to).lean();
            if (!chat) {
                return socket.emit(REQUEST_CALL, { message: "No conversation found" });
            }
        }
        // checking wether user is online or not
        const isUserOnline = await redis.hexists('onlineUsersSocketId', to + "");
        if (isUserOnline === 0) {
            socket.emit(REQUEST_CALL, { message: "User is offline" });
            return;
        }
        // checking for user is on call or not
        const userIsOnCall = await Room.findOne({
            members: { $in: chat.members }
        });
        if (userIsOnCall) {
            return socket.emit(REQUEST_CALL, { message: "The user is currently on another call" })
        }
        const room = await Room.create({ members: chat.members }); // creating room id for the conversation

        const userIdsForSendingIncomingCallEvent = chat.members.filter((id) => id + "" !== socket.clientAuthData._id + "");
        await findUserConnectedToAndSendSocketEventToRabbit(
            userIdsForSendingIncomingCallEvent,
            {
                members: userIdsForSendingIncomingCallEvent,
                user: { _id: socket.clientAuthData._id, user_name: socket.clientAuthData.user_name, avatar_url: socket.clientAuthData.avatar_url },
                roomId: room._id + "",
                event_name: CALL_INCOMING
            },
            true,
            {
                text: `${socket.clientAuthData.user_name} tried to call you`,
                title: "Incoming call",
                url: `/call/${room._id}`
            }
        );
        timeId = setTimeout(async () => {
            await Room.deleteOne({ _id: room._id });
            return socket.emit(REQUEST_CALL, { message: "call unanswered..." })
        }, TIME_TO_WAIT_FOR_CALL_ANSWER);
    })

    socket.on(CALL_INCOMING, async ({ to, response }) => {
        clearTimeout(timeId);
        if (response === "accept") {
            await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
                from: socket.clientAuthData._id,
                event_name: INITIATE_P2P,
                response: "accept",
            }, false)
        }
        else if (response === "reject") {

            await Room.deleteOne({ members: { $in: socket.clientAuthData._id } });
            await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
                from: socket.clientAuthData._id,
                event_name: REQUEST_CALL,
                response: "reject"
            }, false)
        }
    })

    socket.on(RINGING, async ({ to, status }) => {
        if (status === "RECEIVED") {
            await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
                from: socket.clientAuthData._id,
                event_name: RINGING,
                status: "RECEIVED"
            }, false)
        }
    })

    socket.on(CALL_INCOMING_RESPONSE, async ({ to, response }) => {
        if (response === "ACCEPTED") {
            await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
                from: socket.clientAuthData._id,
                event_name: CALL_INCOMING_RESPONSE,
                response: "ACCEPTED"
            }, false);
            await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
                from: socket.clientAuthData._id,
                event_name: INITIATE_P2P,
                response: "ACCEPTED"
            }, false);
        } else if (response === "DECLINED") {
            await Room.deleteOne({ members: { $in: socket.clientAuthData._id } });
            await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
                from: socket.clientAuthData._id,
                event_name: CALL_INCOMING_RESPONSE,
                response: "DECLINED"
            }, false)
        }
    })


    socket.on(INITIAL_OFFER, async ({ to, offer }) => {
        // pub.publish(HANDLE_OFFER_CREATE_ANSWERE, JSON.stringify({ members: [to + ""], from: socket.clientAuthData._id, offer: offer }))
        await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
            from: socket.clientAuthData._id,
            event_name: INITIAL_OFFER,
            offer: offer
        }, false)
    })

    socket.on(INITIAL_ANSWER, async ({ to, ans }) => {
        // pub.publish(HANDLE_ANSWERE, JSON.stringify({
        //     members: [to + ""],
        //     from: socket.clientAuthData._id,
        //     ans
        // }));
        await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
            from: socket.clientAuthData._id,
            event_name: INITIAL_ANSWER,
            ans
        }, false)
    })

    socket.on(RENEGOTIATE_OFFER, async ({ to, offer }) => {
        // pub.publish(RENEGOTIATE_OFFER, JSON.stringify({
        //     members: [to + ""],
        //     from: socket.clientAuthData._id + "",
        //     offer
        // }))

        await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
            from: socket.clientAuthData._id + "",
            event_name: RENEGOTIATE_OFFER,
            offer
        }, false)

    });

    socket.on(SEND_ME_YOUR_STREAM, async ({ to, stream }) => {
        // pub.publish(SEND_ME_YOUR_STREAM, JSON.stringify({
        //     members: [to + ""],
        //     from: socket.clientAuthData._id + "",
        //     stream
        // }))
        await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
            from: socket.clientAuthData._id + "",
            event_name: SEND_ME_YOUR_STREAM,
            stream
        }, false)
    });

    socket.on(RENEGOTIATE_ANSWER, async ({ to, ans }) => {
        // pub.publish(RENEGOTIATE_ANSWER, JSON.stringify({
        //     members: [to + ""],
        //     from: socket.clientAuthData._id + "",
        //     ans
        // }))
        await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
            from: socket.clientAuthData._id + "",
            event_name: RENEGOTIATE_ANSWER,
            ans
        }, false)
    });

    socket.on(END_CALL, async ({ to, roomId }) => {
        await Room.deleteOne({ members: { $in: socket.clientAuthData._id } });
        // pub.publish(END_CALL, JSON.stringify({ members: [to + ""] }))
        await findUserConnectedToAndSendSocketEventToRabbit([to + ""], {
            from: socket.clientAuthData._id,
            event_name: END_CALL,
        }, false)
    })

}
module.exports = { callingFeatures }