const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const verifyJwt = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // console.log("from line 8", process.env.ACCESS_TOKEN_SECRET);

    if (!accessToken) {
        return res.status(401).json({ message: "cookies not available plz login" });
    }
    try {
        let isVerified_access_token
        try {
            isVerified_access_token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.iat = new Date(isVerified_access_token.iat * 1000);
            req.exp = new Date(isVerified_access_token.exp * 1000);
        } catch (error) {
            return res.status(401).json({ message: "access token expired" })
        }

        const clientAuthData = await User.findOne({ "email": isVerified_access_token.email }).select({ password: 0 })


        if (!clientAuthData) {
            res.status(401).json({ message: "token did not match any data" });
        }
        // console.log(clientAuthData);
        req.clientAuthData = clientAuthData;
        next();
    } catch (error) {
        const err = new Error("token from Cookie, authentication failed");
        err.status = 400;
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