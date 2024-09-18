// const { InstanceActiveUserSocketIDs } = require("../app")

const getSockets = (users = [], InstanceActiveUserSocketIDs) => {// user [{_id:"qwrr"},{_id:"qansf"}]
    // console.log(users)
    // console.log(InstanceActiveUserSocketIDs)
    const sockets = users.map((user) => {
        const socket = InstanceActiveUserSocketIDs.get(user._id.toString());
        return socket;
    }).filter((member) => member) // if member is undefined then remove it
    return sockets;

}
module.exports = { getSockets };