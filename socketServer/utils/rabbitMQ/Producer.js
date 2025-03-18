const { RABBIT_MQ_EXCHANGE } = require("../../Constants/constants");
const { getPublishChannel } = require("./initailizeRabbitMq");


const publishMessageToRabbitMQ = async (headers, message) => {
    try {
        // Publish a message with specific headers
        const header = {
            "x-match": "all", // Match all headers
            "server_name": process.env.PORT,
            "content-type": "socket_event"
        }
        const publishChannel = getPublishChannel();
        publishChannel.publish(RABBIT_MQ_EXCHANGE, "", Buffer.from(JSON.stringify(message)), {
            persistent: true, // Ensures message durability
            headers // Attach headers for routing
        });
    } catch (error) {
        console.error("❌ Error:", error);
    }
};
module.exports = { publishMessageToRabbitMQ }
// publishMessageToRabbitMQ(
//     { "x-match": "all",  "server_name": 1234, "content-type": "socket_event" },
//     "New music video uploaded"
// );