const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const verifyAdmin = async (req, res, next) => {
    if (req?.clientAuthData?.admin) {
        next();
    }
    else {
        res.status(400).json({ message: "how dare you, U R NOT ADMIN !" });
    }
};
module.exports = verifyAdmin;