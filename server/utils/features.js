const emitEvent = (req, event, users, data) => {
    console.log("event emitted", event)
}

module.exports = { emitEvent };