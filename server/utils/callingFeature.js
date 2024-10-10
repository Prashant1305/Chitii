const { CLIENT_CREATE_OFFER, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_CREATED_ANSWERE, HANDLE_ANSWERE, PEER_NEGO_NEEDED, PEER_NEGO_DONE, PEER_NEGO_FINAL, END_CALL } = require("../Constants/events")
const Room = require("../models/room")
const { pub } = require("./redis/connectToRedis")


const callingFeatures = (socket, io) => {

    socket.on(CLIENT_CREATE_OFFER, async ({ to, offer }) => {
        pub.publish(HANDLE_OFFER_CREATE_ANSWERE, JSON.stringify({ members: [to + ""], from: socket.clientAuthData._id, offer: offer }))
    })
    socket.on(HANDLE_CREATED_ANSWERE, ({ to, ans }) => {
        pub.publish(HANDLE_ANSWERE, JSON.stringify({
            members: [to + ""],
            from: socket.clientAuthData._id,
            ans
        }));
    })

    socket.on(PEER_NEGO_NEEDED, ({ to, offer }) => {
        pub.publish(PEER_NEGO_NEEDED, JSON.stringify({
            members: [to + ""],
            from: socket.clientAuthData._id + "",
            offer
        }))
    });

    socket.on(PEER_NEGO_DONE, ({ to, ans }) => {
        pub.publish(PEER_NEGO_DONE, JSON.stringify({
            members: [to + ""],
            from: socket.clientAuthData._id + "",
            ans
        }))
    });

    socket.on(END_CALL, async ({ to, roomId }) => {
        await Room.deleteOne({ members: { $in: socket.clientAuthData._id } });
        pub.publish(END_CALL, JSON.stringify({ members: [to + ""] }))
    })

}
module.exports = { callingFeatures }