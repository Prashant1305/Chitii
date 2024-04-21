const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const verifyJwt = async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: "unauthorised HTTP, Token not provided" });
    }
    // console.log("token is: ", jwtToken);
    try {
        const isVerified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log("isVerified: ", isVerified);
        const clientAuthData = await User.findOne({ "email": isVerified.email }).select({ password: 0, refresh_token: 0 })
        if (!clientAuthData) {
            res.status(401).json({ message: "invalid token provided" });
        }
        // console.log(clientAuthData);
        req.clientAuthData = clientAuthData;
        next();
    } catch (error) {
        const err = new Error("problem in token verification");
        err.status = 400;
        err.extraDetails = "from auth_middleware";
        next(err);
    }
};
module.exports = verifyJwt;