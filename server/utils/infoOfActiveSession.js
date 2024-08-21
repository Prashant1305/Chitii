const activeUserSocketIDs = new Map(); // userId, socketId
const onlineUsersIds = new Set();// userId

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomIds = new Map(); // room ,{userIds}

module.exports = { activeUserSocketIDs, onlineUsersIds, emailToSocketIdMap, socketidToEmailMap, roomIds };