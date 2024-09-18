const { INITIATE_P2P, CLIENT_CREATE_OFFER, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_CREATED_ANSWERE, HANDLE_ANSWERE, PEER_NEGO_NEEDED, PEER_NEGO_DONE, PEER_NEGO_FINAL, END_CALL, CALL_RECEIVED_RESPONSE } = require("../Constants/events")
const Conversation = require("../models/conversation_model")
const { getSockets } = require("./helper")
const { roomIds, InstanceActiveUserSocketIDs } = require("./infoOfActiveSession")


const callingFeatures = (socket, io) => {

    socket.on(CLIENT_CREATE_OFFER, async ({ to, offer }) => {
        io.to(to).emit(HANDLE_OFFER_CREATE_ANSWERE, { from: socket.id, offer: offer });
    })
    socket.on(HANDLE_CREATED_ANSWERE, ({ to, ans }) => {
        io.to(to).emit(HANDLE_ANSWERE, { from: socket.id, ans });
    })

    socket.on(PEER_NEGO_NEEDED, ({ to, offer }) => {
        io.to(to).emit(PEER_NEGO_NEEDED, { from: socket.id, offer });
    });

    socket.on(PEER_NEGO_DONE, ({ to, ans }) => {
        io.to(to).emit(PEER_NEGO_FINAL, { from: socket.id, ans });
    });

    socket.on(END_CALL, ({ to, roomId }) => {
        console.log("END_CALL", to, roomId)
        roomIds.delete(roomId);
        io.to(to).emit(END_CALL, {});
    })

}
module.exports = { callingFeatures }