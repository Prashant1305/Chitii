const { Kafka } = require("kafkajs");

class KafkaConsumer {
    constructor(groupId) {
        this.kafka = new Kafka({
            clientId: "push-notification-service",
            brokers: ["localhost:9092"]
        });

        this.consumer = this.kafka.consumer({ groupId });
    }

    async connect() {
        try {
            await this.consumer.connect();
            console.log("kafka connected successfully");
        } catch (error) {
            console.error("Error connecting kafka:", error);
        }
    }

    async subscribe(topic) {
        try {
            await this.consumer.subscribe({ topic });
            console.log(`Subscribed to topic: ${topic}`);
        } catch (error) {
            console.error("Error subscribing to topic:", error);
        }
    }

    async run(messageHandler) {
        try {
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    console.log(`Received message from ${topic}, partition ${partition}:`);

                    if (messageHandler) {
                        messageHandler(topic, partition, JSON.parse(message.value.toString()));
                    }
                }
            });
        } catch (error) {
            console.error("Error processing messages:", error);
        }
    }

    async disconnect() {
        try {
            await this.consumer.disconnect();
            console.log("kafka disconnected");
        } catch (error) {
            console.error("Error disconnecting kafka:", error);
        }
    }
}

module.exports = KafkaConsumer;
