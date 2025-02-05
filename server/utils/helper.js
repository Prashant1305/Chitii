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

// const cookieOptions = {
//     maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
//     httpOnly: true,                 // Prevent access via JavaScript
//     secure: true,                   // Required for HTTPS
//     sameSite: "none"                // Allows cross-site cookies
// }
const cookieOptions = { // for http
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,                 // Prevent access via JavaScript
    secure: true,                   // Required for HTTPS
    sameSite: "lax"                // Allows cross-site cookies
}
module.exports = { getSockets, generateAccessToken, cookieOptions };

