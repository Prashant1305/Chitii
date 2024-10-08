require('dotenv').config();
const { Application } = require("./application/app");
const serverConfig = require("./config.json").servers

const allowedOrigins = [
    'http://www.example.com',
    `${process.env.CORS_ORIGIN}`,
    'https://jq4m0xhj-3000.inc1.devtunnels.ms',
    'https://chitii.vercel.app',
    'https://chitii.netlify.app',
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3010',
    'http://10.45.28.85:3000',
]

var corsOptions = {
    origin: function (origin, callback) {
        if (process.env.NODE_ENV === "development") {
            console.log("req is from ", origin);
        }

        if (allowedOrigins.includes(origin) || !origin || true) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`)); // Block the request
        }
    },
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
};

serverConfig.forEach(({ host, port }) => {
    Application({ host, PORT: port });
})


