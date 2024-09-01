const activeUserSocketIDs = new Map(); // userId, socketId
const onlineUsersIds = new Set();// userId

const roomIds = new Map(); // room ,{userIds}

module.exports = { activeUserSocketIDs, onlineUsersIds, roomIds };