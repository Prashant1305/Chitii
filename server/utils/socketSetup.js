const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { socketAuthenticator } = require("../middleware/auth_middleware");
const { InstanceActiveUserSocketIDs, InstanceOnlineUsersIds } = require("./infoOfActiveSession");
const { startTypingFeature, stopTypingFeature, comingOnlineFeature, goingOfflineFeature, functionCalledForGoingOffline } = require("./features");
const { callingFeatures } = require("./callingFeature");

let io;

function initializeSocket(server, corsOptions) {
    io = new Server(server, { cors: corsOptions });

    io.use((socket, next) => {
        cookieParser()(socket.request, socket.request.res, async (err) => {
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

            if (socket?.clientAuthData?._id.toString()) {
                InstanceOnlineUsersIds.delete(socket.clientAuthData._id.toString());
                functionCalledForGoingOffline(socket, io);
            }
        });
    });

    return io;
}
const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initializeSocket, getIo };
