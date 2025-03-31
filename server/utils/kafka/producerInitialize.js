const kafkaProducerObject = require("./ProducerClass");

async function initializeKafkaProducer() {
    await kafkaProducerObject.connect();

    // await kafkaProducerObject.sendMessage("push-notification", 2, "location-update", "val99");

    // await kafkaProducerObject.disconnect();
}

module.exports = { initializeKafkaProducer, kafkaProducerObject }
