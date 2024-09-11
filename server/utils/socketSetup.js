// socket.js
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { socketAuthenticator } = require("../middleware/auth_middleware");
const { activeUserSocketIDs, onlineUsersIds } = require("./infoOfActiveSession");
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
        activeUserSocketIDs.set(user?._id.toString(), socket.id);

        startTypingFeature(socket, io);
        stopTypingFeature(socket, io);
        comingOnlineFeature(socket, io);
        goingOfflineFeature(socket, io);
        callingFeatures(socket, io);

        socket.on("disconnect", () => {
            console.log("user disconnected");
            activeUserSocketIDs.delete(user?._id.toString());

            if (socket?.clientAuthData?._id.toString()) {
                onlineUsersIds.delete(socket.clientAuthData._id.toString());
                functionCalledForGoingOffline(socket, io);
            }
        });
    });

    return io;
}

module.exports = { initializeSocket, io };
