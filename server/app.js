const express = require("express");
require('dotenv').config();
const cors = require("cors");
const auth_routes = require("./routes/auth_routes");
const connectDb = require("./utils/mongoDb/connectToDb");
const errorMiddleware = require("./middleware/error_middleware");
const cookieParser = require("cookie-parser");
const message_routes = require("./routes/message_routes");
const user_routes = require("./routes/user_routes");

const PORT = process.env.PORT || 3012;
const app = express();
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: "GET, POST, DELETE, PATCH, HEAD",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json()); // to parse incoming requests with json payload and storing it in req.body
app.use(cookieParser());

// checking connection
app.get('/check', (req, res) => {
    res.status(200).json({ msg: "hello server this side" });
});

app.use('/api/auth', auth_routes);
app.use('/api/message', message_routes);
app.use('/api/user', user_routes);


// error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
    connectDb();
    console.log(`server running on port ${PORT}`);
})