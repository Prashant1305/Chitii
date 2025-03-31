const { Kafka } = require("kafkajs");

class KafkaProducer {
    constructor() {
        this.kafka = new Kafka({
            clientId: "push-notification-service",
            brokers: ["localhost:9092"]
        });
        this.producer = this.kafka.producer();
    }

    async connect() {
        try {
            await this.producer.connect();
            console.log("kafka connected successfully");
        } catch (error) {
            console.error("Error connecting kafka:", error);
        }
    }

    async sendMessage(topic, value, partition, key) { // value will be always object which will be stringyfied
        try {
            console.log(`Sending message to ${topic}...`);
            await this.producer.send({
                topic: topic,
                messages: [
                    {
                        partition: partition,
                        key: key,
                        value: JSON.stringify(value)
                    }
                ]
            });
            console.log("Message sent successfully");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    async disconnect() {
        try {
            console.log("Disconnecting producer...");
            await this.producer.disconnect();
            console.log("Producer disconnected");
        } catch (error) {
            console.error("Error disconnecting producer:", error);
        }
    }
}

module.exports = new KafkaProducer();
