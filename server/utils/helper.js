// const { InstanceActiveUserSocketIDs } = require("../app")

const { publishMessageToRabbitMQ } = require("./rabbitMQ/Producer");
const { redis } = require("./redis/connectToRedis");

const getSockets = (users = [], InstanceActiveUserSocketIDs) => {// user [{_id:"qwrr"},{_id:"qansf"}]
    // console.log(users)
    // console.log(InstanceActiveUserSocketIDs)
    const sockets = users.map((user) => {
        const socket = InstanceActiveUserSocketIDs.get(user._id.toString());
        return socket;
    }).filter((member) => member) // if member is undefined then remove it
    return sockets;

}
const generateAccessToken = (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        return { accessToken, refreshToken };

    } catch (error) {
        const err = new Error("token generation failed");
        err.status = 500;
        err.extraDetails = "from generateAccessToken function inside authcontroller";
        next(err);
    }
}


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
module.exports = { getSockets, generateAccessToken, cookieOptions, findUserConnectedToAndSendSocketEventToRabbit };

