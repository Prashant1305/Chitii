const Redis = require("ioredis");
const { ONLINE_USERS, START_TYPING, STOP_TYPING, NEW_MESSAGE, REFETCH_CHATS, NEW_REQUEST, CALL_INCOMING, CALL_RECEIVED_RESPONSE, INITIATE_P2P, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_ANSWERE, PEER_NEGO_NEEDED, PEER_NEGO_DONE, END_CALL } = require("../../Constants/events");


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

    const channels = ["MESSAGES", ONLINE_USERS, START_TYPING, STOP_TYPING, NEW_MESSAGE, REFETCH_CHATS, NEW_REQUEST, CALL_INCOMING, INITIATE_P2P, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_ANSWERE, PEER_NEGO_NEEDED, PEER_NEGO_DONE, END_CALL];
    // Subscribe to multiple channels
    sub.subscribe(channels, (err, count) => {
        if (err) {
            console.error("Failed to subscribe: ", err);
        } else {
            console.log("connection successful to redis")
            console.log(`Subscribed to ${count} channels.`);
        }
    });

    sub.on("message", async (channel, message) => {
        const data = JSON.parse(message)
        let membersSocket;
        const io = getIo()
        // switch (channel) {

        //     case ONLINE_USERS:

        //         const modifiedOnlineFriendIds = data?.onlineFriendIds.map((friend) => ({ _id: friend }))

        //         membersSocket = getSockets(modifiedOnlineFriendIds, InstanceActiveUserSocketIDs); // adding userId so that he can receive online users

        //         if (membersSocket.length > 0) {
        //             const allOnlineMembersOfAllInstance = await redis.smembers("onlineUsersMongoIds");

        //             io.to(membersSocket).emit(ONLINE_USERS, { users: Array.from(allOnlineMembersOfAllInstance) })
        //         }
        //         break;

        //     case START_TYPING:

        //         const modifiedOtherMemberOfChats = data.otherMemberOfChats.map((id) => ({ _id: id }))
        //         membersSocket = getSockets(modifiedOtherMemberOfChats, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(START_TYPING, { chatId: data.chatId, user: data.user });
        //         }
        //         break;

        //     case STOP_TYPING:

        //         const modifiedOtherMemberOfChatsForStopTyping = data.otherMemberOfChats.map((id) => ({ _id: id }))
        //         membersSocket = getSockets(modifiedOtherMemberOfChatsForStopTyping, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(STOP_TYPING, { chatId: data.chatId, user: data.user });
        //         }
        //         break;

        //     case REFETCH_CHATS:

        //         const modifiedMemberOfRefetchChat = data.members.map((id) => ({ _id: id }))
        //         membersSocket = getSockets(modifiedMemberOfRefetchChat, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(REFETCH_CHATS, {});
        //         }
        //         break;

        //     case NEW_MESSAGE:

        //         const modifiedMemberOfNewMessage = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfNewMessage, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(NEW_MESSAGE, data.messageNotification);
        //         }
        //         break;

        //     case NEW_REQUEST:
        //         const modifiedMemberOfNewRequest = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfNewRequest, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(NEW_REQUEST, { msg: `you received freind request from ${data.user_name}` });
        //         }
        //         break;

        //     case CALL_INCOMING:
        //         const modifiedMemberOfCallIncoming = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfCallIncoming, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(CALL_INCOMING, { user: data.user, roomId: data.roomId });
        //             /* ********* // Access a specific socket by its ID */
        //             const specificIncomingCallReceiverSocket = io.sockets.sockets.get(membersSocket[0]);

        //             let responseOfReceiverPromise = () =>
        //             (new Promise((resolve, reject) => {
        //                 specificIncomingCallReceiverSocket.once(CALL_RECEIVED_RESPONSE, (data) => { // once means it will trigger only once
        //                     if (data.status === "ACCEPTED") {
        //                         resolve(data);
        //                     }
        //                     else { // data.status === "DECLINED"
        //                         reject(data);
        //                     }
        //                 });
        //             })
        //             )
        //             try {
        //                 const receivedCallStatus = await responseOfReceiverPromise();
        //                 pub.publish(CALL_RECEIVED_RESPONSE, JSON.stringify(receivedCallStatus))

        //             } catch (error) {
        //                 pub.publish(CALL_RECEIVED_RESPONSE, JSON.stringify(error));
        //             }

        //         }

        //         break;

        //     case INITIATE_P2P:
        //         const modifiedMemberOfInitiateP2P = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfInitiateP2P, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(INITIATE_P2P, { userId: data._id });
        //         }
        //         break;

        //     case HANDLE_OFFER_CREATE_ANSWERE:
        //         const modifiedMemberOfHandleOfferCreateAnswer = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfHandleOfferCreateAnswer, InstanceActiveUserSocketIDs);

        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(HANDLE_OFFER_CREATE_ANSWERE, {
        //                 from: data.from, offer: data.offer
        //             });
        //         }
        //         break;

        //     case HANDLE_ANSWERE:
        //         const modifiedMemberOfHandleAnswer = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfHandleAnswer, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(HANDLE_ANSWERE, {
        //                 from: data.from,
        //                 ans: data.ans
        //             })
        //         }
        //         break;

        //     case PEER_NEGO_NEEDED:
        //         const modifiedMemberOfPeerNegoNeeded = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfPeerNegoNeeded, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(PEER_NEGO_NEEDED, {
        //                 from: data.from,
        //                 offer: data.offer
        //             });
        //         }
        //         break;

        //     case PEER_NEGO_DONE:
        //         const modifiedMemberOfPeerNegoFinal = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfPeerNegoFinal, InstanceActiveUserSocketIDs)
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(PEER_NEGO_DONE, { from: data.from, ans: data.ans });
        //         }
        //         break;

        //     case END_CALL:
        //         const modifiedMemberOfEndCall = data.members.map((id) => ({ _id: id }));
        //         membersSocket = getSockets(modifiedMemberOfEndCall, InstanceActiveUserSocketIDs);
        //         if (membersSocket.length > 0) {
        //             io.to(membersSocket).emit(END_CALL, { from: data.from });
        //         }
        //         break;

        //     default:
        //         console.log("from redis.js", { channel, message })
        //         break;
        // }
    })

    // Handle errors
    redis.on('error', (err) => {
        console.error("From Redis side error:", err);
    });
}

module.exports = { redis, initializeRedis, sub, pub }