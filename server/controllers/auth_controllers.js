const User = require("../models/user_model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict"
}

const signup = async (req, res, next) => {
    try {
        let { full_name, user_name, mobile_number, email, gender, bio, avatar_url, password } = req.body;
        const userExist = await User.findOne({
            $or: [
                { email: email },
                { mobile_number: mobile_number },
                { user_name: user_name }
            ]
        });

        if (userExist) {
            return next({ status: 400, message: "user already exist", extraDetails: "some of info provided are alredy registered" });
        }
        else {

            if (avatar_url === '') {
                const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${user_name}`;
                const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${user_name}`;
                avatar_url = (gender.toLowerCase() === "male") ? boyProfilePic : girlProfilePic;
            }

            // password will be encrypted befor being saved in db
            await User.create({ full_name, user_name, mobile_number, email, gender, avatar_url, password, bio });
            res.status(200).json({ msg: "Successfully Registered" })
        }
    } catch (error) {
        const err = new Error("bad credentials");
        err.status = 201;
        err.extraDetails = "from signup function inside authcontroller";
        next(err);
    }
}

const generateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        // const refreshToken = user.generateRefreshToken();

        user.refresh_token = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        const err = new Error("token generation failed");
        err.status = 201;
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
        const { accessToken, refreshToken } = await generateAccessToken(user._id);


        res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({ msg: "userlogged in succesfully", tokens: { accessToken, refreshToken }, user: { email: user.email, gender: user.gender, avatar_url: user.avatar_url } });
    } catch (error) {
        const err = new Error("unable to login");
        err.status = 400;
        err.extraDetails = "from login function inside authcontroller";
        next(err);
    }
}


const logout = async (req, res, next) => {
    try {
        // console.log(req.clientAuthData._id)
        await User.findByIdAndUpdate(
            req.clientAuthData._id,
            {
                $unset: {
                    refresh_token: 1 // this removes the field from document
                }
            },
            {
                new: true
            }
        )

        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({ message: "User logged Out" });
    }
    // res.status(200).json({ msg: "request reached to logout" })
    catch (error) {
        const err = new Error("unable to logout");
        err.status = 400;
        err.extraDetails = "from logout function inside authcontroller";
        next(err);
    }
}

// const refreshAccessToken = async (req, res, next) => {
//     try {
//         const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

//         if (!incomingRefreshToken) {
//             return res.status(401).json({ message: "refreshToken not provided" });
//         }
//         const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

//         const user = await User.findById(decodedToken?._id);
//         if (!user) {
//             return res.status(401).json({ message: "invalid refresh token provided" });
//         }

//         // if (incomingRefreshToken !== user?.refresh_token) {
//         //     return res.status(401).json({ message: "Refresh token mismatch" });
//         // }
//         const { accessToken, refreshToken } = await generateAccessToken(user._id);

//         console.log(accessToken);
//         res
//             .cookie("accessToken", accessToken, cookieOptions)
//             .cookie("refreshToken", refreshToken, cookieOptions)
//         // .json({ message: "Access token refreshed" })

//     } catch (error) {
//         const err = new Error("refresh token failed");
//         err.status = 400;
//         err.extraDetails = "from refreshAccessToken function inside authcontroller";
//         next(err);
//     }

// }

module.exports = { login, logout, signup };