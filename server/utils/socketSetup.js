const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { socketAuthenticator } = require("../middleware/auth_middleware");
const { InstanceActiveUserSocketIDs, InstanceOnlineUsersIds } = require("./infoOfActiveSession");
const { startTypingFeature, stopTypingFeature, comingOnlineFeature, goingOfflineFeature, functionCalledForGoingOffline } = require("./features");
const { callingFeatures } = require("./callingFeature");
const { getIo, setIo } = require("./socket/io");
const Room = require("../models/room");

function initializeSocket(server, corsOptions) {
    setIo(new Server(server, { cors: corsOptions }));

    const io = getIo();

    io.use((socket, next) => {
        cookieParser()(socket.request, socket.request.res, async (err) => { // cookieParser returns a middleware function which can be used like this
            return await socketAuthenticator(err, socket, next);
        });
    });

    io.on("connection", (socket) => {
        const user = socket.clientAuthData;
        InstanceActiveUserSocketIDs.set(user?._id.toString(), socket.id);

        startTypingFeature(socket, io);
        stopTypingFeature(socket, io);
        comingOnlineFeature(socket, io);
        goingOfflineFeature(socket, io);
        callingFeatures(socket, io);

        socket.on("disconnect", () => {
            console.log("user disconnected");
            InstanceActiveUserSocketIDs.delete(user?._id.toString());
            InstanceOnlineUsersIds.delete(socket.clientAuthData?._id.toString());
            if (socket.clientAuthData) { // when client cookies are expired,
                functionCalledForGoingOffline(socket, io);
                Room.deleteOne({ members: { $in: socket.clientAuthData._id } }).then(() => {
                    console.log("room deleted");
                })
            }
        });
    });

    return io;
}

module.exports = { initializeSocket };
