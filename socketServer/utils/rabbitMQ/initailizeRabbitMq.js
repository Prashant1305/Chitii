const amqp = require("amqplib");
const { RABBIT_MQ_EXCHANGE, RABBIT_MQ_EXCHANGE_TYPE } = require("../../Constants/constants");
const { START_TYPING, STOP_TYPING, UPDATE_ONLINE_STATUS, NEW_MESSAGE, REFETCH_CHATS, NEW_FRIEND_REQUEST, RINGING, CALL_INCOMING, CALL_INCOMING_RESPONSE, INITIATE_P2P, INITIAL_OFFER, INITIAL_ANSWER, RENEGOTIATE_OFFER, RENEGOTIATE_ANSWER, END_CALL, SEND_ME_YOUR_STREAM } = require("../../Constants/events");
const { getIo } = require("../socket/io");
const { redis } = require("../redis/connectToRedis");
const { response } = require("express");

let publishChannel, subscribeChannelForSocket;

const initializeRabbitMQConnection = async () => {

    try {
        // Create a connection to the AMQP server
        const connection = await amqp.connect(process.env.RABBIT_MQ_URL);

        publishChannel = await connection.createChannel(); // create channel
        subscribeChannelForSocket = await connection.createChannel();

        const exchange = RABBIT_MQ_EXCHANGE; // Define exchange name
        const exchangeType = RABBIT_MQ_EXCHANGE_TYPE; // Define exchange type as 'headers'

        // Declare a Headers Exchange
        await publishChannel.assertExchange(exchange, exchangeType, { durable: true });
        await subscribeChannelForSocket.assertExchange(exchange, exchangeType, { durable: true });

        // Declare a queue with a generated unique name
        const q = await subscribeChannelForSocket.assertQueue("", { exclusive: true });

        // Bind the queue to the exchange with specific header bindings
        await subscribeChannelForSocket.bindQueue(q.queue, exchange, "", {
            "x-match": "all", // Match all headers
            "server_name": process.env.PORT,
            "content-type": "socket_event"
        })

        // Consume messages from the queue
        subscribeChannelForSocket.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                console.info("Received new socket event", message);
                // Notification handling code will go here!
                await consumeSocketEvents(message);

                subscribeChannelForSocket.ack(msg); // Acknowledge the message
            }
        });

        console.info("conection successful to RabbitMQ")
    } catch (error) {
        console.error(error);
    }
}


// Function to get the publishChannel after it's initialized
const getPublishChannel = () => {
    if (!publishChannel) {
        console.error("❌ Error: RabbitMQ publish channel is not initialized yet!");
    }
    return publishChannel;
};

const consumeSocketEvents = async (message) => {
    // write switch case message.event_name
    try {
        const io = getIo();
        let socket_ids, user;

        switch (message.event_name) {
            case START_TYPING:
                console.log(START_TYPING);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);
                user = {
                    _id: message.user._id, user_name: message.user.user_name, avatar_url: message.user.avatar_url
                }
                io.to(socket_ids).emit(START_TYPING, { chatId: message.chatId, user })
                break;

            case STOP_TYPING:
                console.log(STOP_TYPING);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);
                user = {
                    _id: message.user._id, user_name: message.user.user_name, avatar_url: message.user.avatar_url
                }
                io.to(socket_ids).emit(STOP_TYPING, { chatId: message.chatId, user })
                break;

            case UPDATE_ONLINE_STATUS:
                console.log(UPDATE_ONLINE_STATUS);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of friends
                // user = {
                //     _id: message.user._id
                // }
                io.to(socket_ids).emit(UPDATE_ONLINE_STATUS, { user: message.user._id, user_online_status: message.user_online_status });
                break;

            case NEW_MESSAGE:
                console.log(NEW_MESSAGE);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socket of chat members
                io.to(socket_ids).emit(NEW_MESSAGE, message.messageNotification)
                break;

            case REFETCH_CHATS:
                console.log(REFETCH_CHATS);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketids of chat member
                io.to(socket_ids).emit(REFETCH_CHATS, {});
                break;

            case NEW_FRIEND_REQUEST:
                console.log(NEW_FRIEND_REQUEST);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(NEW_FRIEND_REQUEST, { msg: `you received freind request from ${message.user_name}` });
                break;

            case CALL_INCOMING:
                console.log("CALL_INCOMING");
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit("CALL_INCOMING", { msg: `you received call from ${message.user_name}`, roomId: message.roomId, user: message.user });
                break;

            case RINGING:
                console.log(RINGING);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(RINGING, {});
                break;

            case CALL_INCOMING_RESPONSE:
                console.log(CALL_INCOMING_RESPONSE);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(CALL_INCOMING_RESPONSE, { response: message.response, from: message.from });
                break;

            case INITIATE_P2P:
                console.log(INITIATE_P2P);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(INITIATE_P2P, { response: message.response, from: message.from });
                break;

            case INITIAL_OFFER:
                console.log(INITIAL_OFFER);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(INITIAL_OFFER, { ...message });
                break;

            case INITIAL_ANSWER:
                console.log(INITIAL_ANSWER);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(INITIAL_ANSWER, { ...message });
                break;

            case SEND_ME_YOUR_STREAM:
                console.log(SEND_ME_YOUR_STREAM);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(SEND_ME_YOUR_STREAM, { ...message });
                break;

            case RENEGOTIATE_OFFER:
                console.log(RENEGOTIATE_OFFER);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(RENEGOTIATE_OFFER, { ...message });
                break;

            case RENEGOTIATE_ANSWER:
                console.log(RENEGOTIATE_ANSWER);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(RENEGOTIATE_ANSWER, { ...message });
                break;

            case END_CALL:
                console.log(END_CALL);
                socket_ids = await redis.hmget("onlineUsersSocketId", ...message.members);//getting socketIds of receiver
                io.to(socket_ids).emit(END_CALL, { ...message });
                break;

            default:
                console.error(`Unknown event ${message.event_name} detected at server ${process.env.PORT}`);
        }
    } catch (error) {
        console.log(error);
    }

}
module.exports = { initializeRabbitMQConnection, getPublishChannel };