let io;

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

const setIo = (newIo) => {
    io = newIo;
}

module.exports = { getIo, setIo }