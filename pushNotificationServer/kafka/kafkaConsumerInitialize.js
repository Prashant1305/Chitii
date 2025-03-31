const { KAFKA_TOPIC_PUSH_NOTIFICATION } = require("../Constants/constants");
const { sendNotification } = require("../sendNotification");
;
const KafkaConsumer = require("./kafkaConsumerClass");

const kafkaConsumerObject = new KafkaConsumer("push-notification-group");

async function initializeConsumer() {
    await kafkaConsumerObject.connect();
    await kafkaConsumerObject.subscribe(KAFKA_TOPIC_PUSH_NOTIFICATION);

    await kafkaConsumerObject.run((topic, partition, message) => { // message is parsed already
        console.log("Processed Message:", message);
        sendNotification(message);
    });
}

module.exports = { initializeConsumer, kafkaConsumerObject }
