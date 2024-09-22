const { CALL_INCOMING, CALL_RECEIVED_RESPONSE, INITIATE_P2P } = require("../Constants/events");
const Conversation = require("../models/conversation_model");
const Room = require("../models/room");

const { pub, sub, redis } = require("../utils/redis/connectToRedis");

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
        const isUserOnline = await redis.sismember('onlineUsersMongoIds', receiverClientId + "");
        if (isUserOnline === 0) {
            return res.status(203).send({ message: "User is offline" });
        }

        // checking for user is on call or not
        const userIsOnCall = await Room.findOne({
            members: { $in: chat.members }
        });
        if (userIsOnCall) {
            return res.status(203).json({ message: "user is on call" })
        }
        const room = await Room.create({ members: chat.members }); // creating room id for the conversation

        const userIdsForSendingIncomingCallEvent = chat.members.filter((id) => id + "" !== req.clientAuthData._id + "")

        pub.publish(CALL_INCOMING, JSON.stringify({
            members: userIdsForSendingIncomingCallEvent,
            user: { _id: req.clientAuthData._id, user_name: req.clientAuthData.user_name, avatar_url: req.clientAuthData.avatar_url },
            roomId: room._id + ""
        }))

        const timeId = setTimeout(async () => {
            await Room.deleteOne({ _id: room._id });
            return res.status(200).json({ message: "call unanswered..." })
        }, 8000);

        let responseOfReceiverPromise = () =>
        (new Promise((resolve, reject) => {

            sub.subscribe(CALL_RECEIVED_RESPONSE, (err, _) => {
                if (err) {
                    console.error("Failed to subscribe CallStatus: ", err);
                } else {
                    console.log(`Subscribed to CallStatus channels.`);
                }
            });

            sub.on("message", (channel, message) => {
                const data = JSON.parse(message)
                if (channel === CALL_RECEIVED_RESPONSE && data._id + "" === req.clientAuthData._id.toString()) {
                    if (data.status === "ACCEPTED") {
                        resolve(data);
                    }
                    else { // data.status === "DECLINED"
                        reject(data);
                    }
                    sub.unsubscribe(CALL_RECEIVED_RESPONSE);
                }
            });
        })
        )

        try {
            await responseOfReceiverPromise();

            pub.publish(INITIATE_P2P, JSON.stringify({
                members: [req.clientAuthData._id.toString()],
                _id: receiverClientId + ""
            }));
            return res.status(200).json({ message: "call Accepted" })
        } catch (error) {
            await Room.deleteOne({ _id: room._id });
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