const express = require("express");
require('dotenv').config();
const connectDb = require("./utils/mongoDb/connectToDb");
const { createServer } = require('http');
const { initializeConsumer } = require("./kafka/kafkaConsumerInitialize");

const PORT = process.env.PORT || 4000;
const app = express();

const server = createServer(app);

// initailize consumer
initializeConsumer().then(() => {
    console.log("Consumer initialized");
}).catch((error) => {
    console.log(error);
})

// checking connection
app.get('/api/check', (req, res) => {
    res.status(200).json({
        msg: `hello from pushNotification server at port ${PORT}`
    });
});

server.listen(PORT, () => {
    connectDb();
    console.log(`server running on port ${PORT}`);
})