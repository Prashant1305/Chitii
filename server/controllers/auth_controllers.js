const User = require("../models/user_model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadOnCloudinary } = require("../utils/cloudinaryDb/cloudinary");
const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict"
}

const signup = async (req, res, next) => {
    try {
        let { full_name, user_name, mobile_number, email, gender, bio = "", password } = req.body;
        const userExist = await User.findOne({
            $or: [
                { email: email },
                { mobile_number: mobile_number },
                { user_name: user_name }
            ]
        });
        console.log(userExist)
        if (userExist) {
            return next({ status: 400, message: "user already exist", extraDetails: "some of info provided are alredy registered" });
        }
        else {
            let avatar_url;
            if (req.file) {
                const uploadedDp = await uploadOnCloudinary(req.file.path);
                avatar_url = uploadedDp.secure_url

            } else {
                const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${user_name}`;
                const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${user_name}`;
                avatar_url = (gender.toLowerCase() === "male") ? boyProfilePic : girlProfilePic;
            }

            // password will be encrypted befor being saved in db
            await User.create({ full_name, user_name, mobile_number, email, gender, avatar_url, password, bio });
            res.status(200).json({ message: "Successfully Registered" })
        }
    } catch (error) {
        const err = new Error("bad credentials");
        err.status = 500;
        err.extraDetails = "from signup function inside authcontroller";
        next(err);
    }
}

const generateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();

        await user.save({ validateBeforeSave: false });
        return { accessToken };

    } catch (error) {
        const err = new Error("token generation failed");
        err.status = 500;
        err.extraDetails = "from generateAccessToken function inside authcontroller";
        next(err);
    }
}

const login = async (req, res, next) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return next({ message: "email or password missing", status: 201, extraDetails: "from login function inside authcontroller" });
        }
        const user = await User.findOne({
            $or: [{ user_name: emailOrUsername }, { email: emailOrUsername }]
        })

        if (!user) {
            return next({ message: "email or username invalid", status: 201, extraDetails: "from login function inside authcontroller" });
        }
        // console.log(user);
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return next({ message: "password invalid", status: 400, extraDetails: "from login function inside authcontroller" });
        }
        const { accessToken } = await generateAccessToken(user._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .json({
                message: "userlogged in succesfully", tokens: { accessToken }, time: process.env.ACCESS_TOKEN_EXPIRY, user: {
                    _id: user._id,
                    user_name: user.user_name,
                    email: user.email,
                    full_name: user.full_name,
                    mobile_number: user.mobile_number,
                    bio: user.bio,
                    gender: user.gender,
                    avatar_url: user.avatar_url,
                    createdAt: user.createdAt,
                    isAdmin: user.isAdmin
                }
            });
    } catch (error) {
        const err = new Error("unable to login");
        err.status = 400;
        err.extraDetails = "from login function inside authcontroller";
        next(err);
    }
}


const logout = async (req, res, next) => {
    try {

        return res
            .status(200)
            .clearCookie("accessToken", { ...cookieOptions, maxAge: 0 })
            .json({ message: "User logged Out" });
    }

    catch (error) {
        const err = new Error("unable to logout");
        err.status = 400;
        err.extraDetails = "from logout function inside authcontroller";
        next(err);
    }
}




module.exports = { login, signup, logout };