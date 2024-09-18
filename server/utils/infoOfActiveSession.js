const InstanceActiveUserSocketIDs = new Map(); // userId, socketId
const InstanceOnlineUsersIds = new Set();// userId

const roomIds = new Map(); // room ,{userIds}

module.exports = { InstanceActiveUserSocketIDs, InstanceOnlineUsersIds, roomIds };