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
            // console.log("isVerified_access_token: ", isVerified_access_token);
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
module.exports = verifyJwt;