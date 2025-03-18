const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const { socketAuthenticator } = require("../../middleware/auth_middleware");
const { InstanceActiveUserSocketIDs, InstanceOnlineUsersIds } = require("../infoOfActiveSession");
const { startTypingFeature, stopTypingFeature, comingOnlineFeature, goingOfflineFeature, functionCalledForGoingOffline, notifyFriendsOfOnlineStatus } = require("../features");

const { getIo, setIo } = require("./io");
const Room = require("../../models/room");
const { redis } = require("../redis/connectToRedis");
const { REDIS_ONLINE_USERS_ID_MAPPED_WITH_SOCKET_ID } = require("../../Constants/constants");

function initializeSocket(server, corsOptions) {
    setIo(new Server(server, { cors: corsOptions }));

    const io = getIo();

    io.use((socket, next) => {
        cookieParser()(socket.request, socket.request.res, async (err) => { // cookieParser returns a middleware function which can be used like this
            return await socketAuthenticator(err, socket, next);
        });
    });

    io.on("connection", async (socket) => {
        // Add the connected socket's ID to a Redis set with the key based on the port number
        try {
            // adding mongo id
            await Promise.all([redis.sadd(`${process.env.PORT}`, socket.clientAuthData._id),
            redis.hset(REDIS_ONLINE_USERS_ID_MAPPED_WITH_SOCKET_ID, socket.clientAuthData._id, socket.id)])
            console.log(`Added socket ${socket.id} to set for port ${process.env.PORT}`);
        } catch (error) {
            console.error("Error adding socket to Redis set:", error);
        }
        startTypingFeature(socket, io);
        stopTypingFeature(socket, io);
        notifyFriendsOfOnlineStatus(socket, io);

        socket.on("disconnect", async () => {
            console.log("user disconnected");
            try {
                const [result, _] = await Promise.all([redis.srem(process.env.PORT, socket.clientAuthData._id), redis.hdel(REDIS_ONLINE_USERS_ID_MAPPED_WITH_SOCKET_ID, socket.clientAuthData._id)])
                console.log("Number of members removed:", result);
            } catch (err) {
                console.error("Error removing socket id:", err);
            }

            if (socket.clientAuthData) { // when client cookies are expired,
                Room.deleteOne({ members: { $in: socket.clientAuthData._id } }).then(() => {
                    console.log("room deleted");
                })
            }
        });
    });

    return io;
}

module.exports = { initializeSocket };
