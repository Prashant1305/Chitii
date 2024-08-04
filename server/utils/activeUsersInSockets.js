const activeUserSocketIDs = new Map(); // userId, socketId
const onlineUsersIds = new Set();// userId

module.exports = { activeUserSocketIDs, onlineUsersIds };