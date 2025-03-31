// const { InstanceActiveUserSocketIDs } = require("../app")

const { KAFKA_TOPIC_PUSH_NOTIFICATION } = require("../Constants/constants");
const { kafkaProducerObject } = require("./kafka/producerInitialize");
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


const findUserConnectedToAndSendSocketEventToRabbit = async (members = [], message, firePushNotification = false, pushNotificationMessage = { text: "Defualt Push Notification Message", title: "default title", url: "" }) => { // members is array of mongo ids
    try {
        const onlineServerList = await redis.smembers("onlineSocketServers");
        onlineServerList.map((server_name) => console.log({ server_name }));

        const result = await Promise.all(onlineServerList.map((server_name) => redis.smismember(server_name, ...members)));
        // result=>      [         m1  m2  m3  m4  m5   index
        // s1  0   1   0   0   0     0
        // s2  1   0   0   0   0     1
        // s3  0   0   1   1   0     2  
        // s4  0   0   0   0   0  ]  3

        const onlineServerNameMapToFriendsName = []; //{server_name:"3011",members:["s1",s2]}

        onlineServerList.forEach((server_name) => {
            onlineServerNameMapToFriendsName.push({ server_name, members: [] })
        });

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

        if (firePushNotification) {
            const offlineMembers = [];

            for (let i = 0; i < result[0].length; i++) {
                let isConectedToAnyServer = false;
                for (let j = 0; j < result.length; j++) {
                    if (result[j][i] === 1) {
                        isConectedToAnyServer = true;
                        break;
                    }
                }
                if (!isConectedToAnyServer) {
                    offlineMembers.push(members[i]);
                }
            }

            // sending message to offline members
            kafkaProducerObject.sendMessage(KAFKA_TOPIC_PUSH_NOTIFICATION, {
                data: {
                    members: offlineMembers,
                    message: pushNotificationMessage // {text:"",title:"",url=""}
                }
            });
        }

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

