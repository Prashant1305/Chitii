const express = require("express");
require('dotenv').config();
const { createServer } = require('http');

const connectDb = require("./utils/mongoDb/connectToDb");

const { socketAuthenticator } = require("./middleware/auth_middleware");
const { initializeSocket } = require("./utils/socket/socketSetup");
const { initializeRedis } = require("./utils/redis/connectToRedis");
const { initializeRabbitMQConnection } = require("./utils/rabbitMQ/initailizeRabbitMq");



const PORT = process.env.PORT || 3011;

const app = express();

const allowedOrigins = [
    'http://www.example.com',
    `${process.env.CORS_ORIGIN}`,
    'https://jq4m0xhj-3000.inc1.devtunnels.ms',
    'https://vjqcs0m9-3000.inc1.devtunnels.ms',
    'https://chitii.vercel.app',
    'https://chitii.netlify.app',
    'http://localhost:3001',
]

var corsOptions = {
    origin: function (origin, callback) {
        if (process.env.NODE_ENV === "development") {
            console.log("req is from ", origin);
        }

        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`)); // Block the request
        }
    },
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
};

// SOCKET
const server = createServer(app);
const io = initializeSocket(server, corsOptions)

// checking connection
app.get('/api/check/socketserver', (req, res) => {
    res.status(200).json({
        msg: `hello from server at port ${PORT}`
    });
});

// initialize Redis
initializeRedis();

//intialize RabbitMQ
initializeRabbitMQConnection();

server.listen(PORT, () => {
    connectDb();
    console.log(`server running on port ${PORT}`);
})