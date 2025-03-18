const amqp = require("amqplib");
const { RABBIT_MQ_EXCHANGE, RABBIT_MQ_EXCHANGE_TYPE } = require("../../Constants/constants");
const { START_TYPING, STOP_TYPING, UPDATE_ONLINE_STATUS, NEW_MESSAGE, REFETCH_CHATS, NEW_FRIEND_REQUEST } = require("../../Constants/events");
const { getIo } = require("../socket/io");
const { redis } = require("../redis/connectToRedis");

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
                console.log("Received new socket event", message);
                // Notification handling code will go here!
                await consumeSocketEvents(message);

                subscribeChannelForSocket.ack(msg); // Acknowledge the message
            }
        });

        console.log("conection succesful to RabbitMQ")
    } catch (error) {
        console.log(error);
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

            default:
                console.error(`Unknown event ${message.event_name} detected at server ${process.env.PORT}`);
        }
    } catch (error) {
        console.log(error);
    }

}
module.exports = { initializeRabbitMQConnection, getPublishChannel };