const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const { cookieOptions, generateAccessToken } = require("../utils/helper");

const verifyJwt = async (req, res, next) => {

    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
        return res.status(497).json({ message: "cookies not available plz login" });
    }
    try {
        const { _id, email } = jwt.decode(accessToken);
        const user = await User.findById(_id);
        try {
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        } catch (error) { // when access token is expired
            if (error.name === "TokenExpiredError") { // if token is tampered then it will be different error
                try {
                    jwt.verify(user.refresh_token, process.env.REFRESH_TOKEN_SECRET);
                    const { accessToken, refreshToken, exp } = generateAccessToken(user);
                    user.refresh_token = refreshToken;
                    res.cookie("accessToken", accessToken, cookieOptions)
                    await user.save()
                } catch (error) {
                    return res.status(497).json({ message: "refresh token expired, plz login" });
                }
            }
        }
        req.clientAuthData = user;
        next();
    } catch (error) {
        const err = new Error("token from Cookie, authentication failed");
        err.status = 497;
        err.extraDetails = "from auth_middleware";
        next(err);
    }
};

const socketAuthenticator = async (err, socket, next) => {
    try {
        if (err) {
            return next(err)
        }
        const accessToken = socket.request.cookies.accessToken;
        // console.log("from socket auth middleware", accessToken)

        if (!accessToken) {
            return next(new Error("no access token found"));
        }
        const decodedData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const clientAuthData = await User.findOne({ "email": decodedData.email }).select({ password: 0 })
        // console.log(clientAuthData)
        if (!clientAuthData) {
            socket.disconnect(true); // Forcefully disconnect
            return next(new Error("token did not match any data"));
        }
        socket.clientAuthData = clientAuthData;
        next();

    } catch (error) {
        const erro = new Error("socket authentication failed, plz try later");
        erro.status = 400;
        erro.extraDetails = "from socketAuthenticator function inside auth_middleware";
        next(erro);
        return next()
    }
}

module.exports = { verifyJwt, socketAuthenticator };