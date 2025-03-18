const { publishMessageToRabbitMQ } = require("./rabbitMQ/Producer");
const { redis } = require("./redis/connectToRedis");

const findUserConnectedToAndSendSocketEventToRabbit = async (members = [], message) => {
    try {
        const onlineServerList = await redis.smembers("onlineSocketServers");
        onlineServerList.map((server_name) => console.log({ server_name }));

        const result = await Promise.all(onlineServerList.map((server_name) => redis.smismember(server_name, ...members)));

        const onlineServerNameMapToFriendsName = []; //{server_name:"3011",members:["s1",s2]}

        onlineServerList.forEach((server_name) => {
            onlineServerNameMapToFriendsName.push({ server_name, members: [] })
        })

        result.forEach((arr, idx) => {
            arr.forEach((member, index) => {
                if (member === 1) {
                    for (let i of onlineServerNameMapToFriendsName) {
                        if (i.server_name === onlineServerList[idx]) {
                            i.members.push(members[index])
                        }
                    }
                }
            });
        })
        console.log(onlineServerNameMapToFriendsName)

        // then send message to RabbitMQ
        onlineServerNameMapToFriendsName.forEach(async (ele) => {
            if (ele.members.length > 0) {
                const headers = { "x-match": "all", "server_name": ele.server_name, "content-type": "socket_event" };
                await publishMessageToRabbitMQ(headers, { ...message, "members": ele.members });
            }
        })



    } catch (error) {
        console.log(error)
    }
}

// const cookieOptions = {
//     maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
//     httpOnly: true,                 // Prevent access via JavaScript
//     secure: process.env.NODE_ENV ==="PRODUCTION",                  // Required for HTTPS
//     sameSite: "none"                // Allows cross-site cookies
// }
const cookieOptions = { // for http
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,                 // Prevent access via JavaScript
    secure: process.env.HTTPS_ENABLED,                   // Required for HTTPS
    sameSite: "lax"                // Allows cross-site cookies
}
module.exports = { cookieOptions, findUserConnectedToAndSendSocketEventToRabbit };

