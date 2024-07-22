// const { activeUserSocketIDs } = require("../app")

const getSockets = (users = [], activeUserSocketIDs) => {
    // console.log(users)
    console.log(activeUserSocketIDs)
    const sockets = users.map((user) => {
        const socket = activeUserSocketIDs.get(user._id.toString());
        return socket;
    }).filter((member) => member) // if member is undefined then remove it
    return sockets;

}
module.exports = { getSockets };