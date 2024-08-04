const express = require("express");
require('dotenv').config();
const cors = require("cors");
const auth_routes = require("./routes/auth_routes");
const connectDb = require("./utils/mongoDb/connectToDb");
const errorMiddleware = require("./middleware/error_middleware");
const cookieParser = require("cookie-parser");
const chat_routes = require("./routes/chat_routes");
const user_routes = require("./routes/user_routes");
const admin_routes = require("./routes/admin/admin_routes");
const { Server } = require("socket.io");
const { createServer } = require('http');
const { v4 } = require("uuid");

const bodyParser = require('body-parser');
const { NEW_MESSAGE, START_TYPING } = require("./Constants/events");
const { getSockets } = require("./utils/helper");
const Conversation = require("./models/conversation_model");
const Message = require("./models/message_model");
const { socketAuthenticator } = require("./middleware/auth_middleware");
const { activeUserSocketIDs, onlineUsersIds } = require("./utils/activeUsersInSockets");
const { startTypingFeature, stopTypingFeature, comingOnlineFeature, goingOfflineFeature, functionCalledForGoingOffline } = require("./utils/features");

const PORT = process.env.PORT || 3012;
const app = express();

const allowedOrigins = [
    'http://www.example.com',
    `${process.env.CORS_ORIGIN}`,
    'https://jq4m0xhj-3000.inc1.devtunnels.ms/'
]

var corsOptions = {
    origin: function (origin, callback) {
        // console.log("req is from ", origin);
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`)); // Block the request
        }
    },
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json()); // to parse incoming requests with json payload and storing it in req.body
app.use(bodyParser.urlencoded({ extended: true })); // to parse incoming urlencoded data that contains only file
app.use(cookieParser());

// SOCKET
const server = createServer(app);
const io = new Server(server, { cors: corsOptions })

app.set('socketio', io); // Store io instance in app

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, async (err) => { // cookieParser returns a middleware function which can be used like this
        return await socketAuthenticator(err, socket, next);
    });
});

// io.use(socketAuthenticator);

// checking connection
app.get('/check', (req, res) => {
    res.status(200).json({
        msg: {
            "todos": [
                {
                    "id": 1,
                    "title": "Learn React",
                    "completed": true
                },
                {
                    "id": 2,
                    "title": "book return ticket",
                    "completed": false
                }
            ]
        }
    });
});


app.use('/api/auth', auth_routes);
app.use('/api/chat', chat_routes);
app.use('/api/user', user_routes);
app.use('/api/admin', admin_routes);



// app.get('/api/event', (req, res, next) => {
//     // console.dir(next)
//     sendMessage(req, res, next, io)
// })

io.on("connection", (socket) => {
    const user = socket.clientAuthData;
    // user = {
    //     _id: "666b18ac26af93467acb91b2",
    //     name: "lavda lassan"
    // }
    activeUserSocketIDs.set(user?._id.toString(), socket.id);
    console.log(activeUserSocketIDs)

    // socket.on(NEW_MESSAGE, async ({ chatId, message }) => {
    //     const messageForRealTime = {
    //         text_content: message,
    //         _id: v4(),
    //         sender: {
    //             _id: user._id,
    //             name: user.name
    //         },
    //         chat: chatId,
    //         createdAt: new Date().toISOString(),
    //     };
    //     console.log(messageForRealTime)

    //     const messageForDb = {
    //         text_content: message,
    //         sender: user._id,
    //         conversation: chatId,
    //         attachments: []
    //     }
    //     try {
    //         const { members } = await Conversation.findById(chatId)?.select({ members: 1 })?.lean();

    //         const membersSocket = getSockets(members, activeUserSocketIDs); // active members that will receive this message
    //         io.to(membersSocket).emit("NEW_MESSAGE", { conversationId: chatId, message: messageForRealTime });
    //         await Message.create(messageForDb);
    //     } catch (error) {
    //         console.log("failed to get members of chat")
    //     }

    // })

    startTypingFeature(socket, io);
    stopTypingFeature(socket, io);
    comingOnlineFeature(socket, io);
    goingOfflineFeature(socket, io);

    socket.on("disconnect", () => {
        // console.log("user disconnected");
        activeUserSocketIDs.delete(user?._id.toString());
        console.log("befor", onlineUsersIds)
        if (socket?.clientAuthData?._id.toString()) {
            onlineUsersIds.delete(socket.clientAuthData._id.toString());
            functionCalledForGoingOffline(socket, io);
            console.log("after", onlineUsersIds)
        }
        //stop typing event to firends
    });
});

// error middleware
app.use(errorMiddleware);


// app.listen(PORT, () => {
//     connectDb();
//     console.log(`server running on port ${PORT}`);
// })
server.listen(PORT, () => {
    connectDb();
    console.log(`server running on port ${PORT}`);
})
