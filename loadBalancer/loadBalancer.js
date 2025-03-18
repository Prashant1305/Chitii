const http = require("http");
const roundRobin = require("./roundRobin");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const { servers, socket_servers } = require("./config.json")

const allowedOrigins = [
    'http://www.example.com',
    `${process.env.CORS_ORIGIN}`,
    'http://localhost:3000',
]

var corsOptions = {
    origin: function (origin, callback) {
        console.log("req is from ", origin);
        if (allowedOrigins.includes(origin) || !origin || true) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`)); // Block the request
        }
    },
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
    allowedHeaders: ['Content-Type'],
    preflightContinue: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());

// any modification from json
// const servers = servers.map((server) => ({ ...server }));
// const socket_servers = socket_servers.map((server) => ({ ...server }));

const loadBalancingAlgorithm = "RoundRobin";

let session_number = 0;

const addCookie = (req, res, next) => {
    if (!req.cookies.session_number) {
        console.log("session created")
        res.cookie("session_number", session_number); // adding cookie so that, client saves this session number
        req.cookies = { ...req.cookies, session_number: session_number };
        session_number++;
    }
    next();
};

app.use(addCookie)

// checking connection
app.get('/check', (req, res) => {
    res.status(200).json({
        msg: `hello from server at port ${PORT}`
    });
});

const server = http.createServer(app);

app.use((req, res) => {
    if (loadBalancingAlgorithm === "RoundRobin") {
        roundRobin(servers, socket_servers, req, res);
    } else {
        res.status(200).json({ msg: "Load balancing algorithm not supported" })
    }
})

server.listen(3010, () => {
    console.log(`Load balancing server started at 3010`);
})
