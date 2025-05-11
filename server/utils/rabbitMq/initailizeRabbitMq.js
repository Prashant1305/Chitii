const amqp = require("amqplib");
const { RABBIT_MQ_EXCHANGE, RABBIT_MQ_EXCHANGE_TYPE } = require("../../Constants/constants");

let publishChannel;

const initializeRabbitMQConnection = async () => {

    try {
        // Create a connection to the AMQP server
        const connection = await amqp.connect(process.env.RABBIT_MQ_URL);

        publishChannel = await connection.createChannel(); // create channel

        const exchange = RABBIT_MQ_EXCHANGE; // Define exchange name
        const exchangeType = RABBIT_MQ_EXCHANGE_TYPE; // Define exchange type as 'headers'

        // Declare a Headers Exchange
        await publishChannel.assertExchange(exchange, exchangeType, { durable: true });

        console.log("coneection succesful to RabbitMQ")
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


module.exports = { initializeRabbitMQConnection, getPublishChannel };