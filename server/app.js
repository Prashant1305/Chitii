const express = require("express");
require('dotenv').config();
const cors = require("cors");
const auth_routes = require("./routes/auth_routes");
const connectDb = require("./utils/mongoDb/connectToDb");
const errorMiddleware = require("./middleware/error_middleware");
const cookieParser = require("cookie-parser");
const chat_routes = require("./routes/chat_routes");
const user_routes = require("./routes/user_routes");
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 3012;
const app = express();


const allowedOrigins = [
    'http://www.example.com',
    `${process.env.CORS_ORIGIN}`,
]

var corsOptions = {
    origin: function (origin, callback) {
        console.log("req is from ", origin);
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`)); // Block the request
        }
    },
    methods: "GET, POST, DELETE, PATCH, HEAD",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json()); // to parse incoming requests with json payload and storing it in req.body
app.use(bodyParser.urlencoded({ extended: true })); // to parse incoming urlencoded data that contains only file
app.use(cookieParser());

// checking connection
app.get('/check', (req, res) => {
    res.status(200).json({ msg: "hello server this side" });
});

app.use('/api/auth', auth_routes);
app.use('/api/chat', chat_routes);
app.use('/api/user', user_routes);


// error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
    connectDb();
    console.log(`server running on port ${PORT}`);
})