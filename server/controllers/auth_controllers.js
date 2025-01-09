const User = require("../models/user_model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadOnCloudinary } = require("../utils/cloudinaryDb/cloudinary");
const { generateAccessToken, cookieOptions } = require("../utils/helper");
const axios = require("axios");
const qs = require('qs'); // Import qs module at the top

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


const loginWithChitii = async (req, res, next) => {
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
        const { accessToken, refreshToken } = generateAccessToken(user);
        user.refresh_token = refreshToken;
        await user.save();

        res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .json({
                message: "userlogged in succesfully",
                tokens: { accessToken },
                user: {
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
            .clearCookie("session_number", { ...cookieOptions, maxAge: 0 })
            .json({ message: "User logged Out" });
    } catch (error) {
        const err = new Error("unable to logout");
        err.status = 400;
        err.extraDetails = "from logout function inside authcontroller";
        next(err);
    }
}

const loginWithGoogleCode = async (req, res, next) => {
    try {
        const { code: googleCode } = req.query;
        const googleCodeRequestUrl = 'https://oauth2.googleapis.com/token';
        const googleCodeRequestData = {
            'code': `${googleCode}`,
            'client_id': process.env.GOOGLE_CLIENT_ID,
            'client_secret': process.env.GOOGLE_CLIENT_SECRET,
            'redirect_uri': process.env.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        const responseOfGoogleCodeRequest = await axios.post(googleCodeRequestUrl, googleCodeRequestData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        if (responseOfGoogleCodeRequest.status === 200) {
            // from accessToken now retriving userInfo
            const googleAccessToken = responseOfGoogleCodeRequest.data.access_token;
            const retriveUserInfoGoogleUrl = `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers,photos`
            const retriveUserInfoGoogleRequest = await axios.get(retriveUserInfoGoogleUrl, {
                headers: {
                    'Authorization': `Bearer ${googleAccessToken}`
                }
            });
            if (retriveUserInfoGoogleRequest.status === 200) {
                const name = retriveUserInfoGoogleRequest.data.names[0].displayName, email = retriveUserInfoGoogleRequest.data.emailAddresses[0].value, avatar_url = retriveUserInfoGoogleRequest.data.photos[0].default ? `https://avatar.iran.liara.run/public/boy?username=${name}` : retriveUserInfoGoogleRequest.data.photos[0].url;

                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({ email, account_type: "GOOGLE", full_name: name, avatar_url, google_data: retriveUserInfoGoogleRequest.data });
                } else {// update userInfo
                    user.full_name = name;
                    user.avatar_url = avatar_url;
                    user.google_data = retriveUserInfoGoogleRequest.data
                }
                const { accessToken, refreshToken } = generateAccessToken(user);
                user.refresh_token = refreshToken;
                await user.save();
                return res
                    .status(200)
                    .cookie("accessToken", accessToken, cookieOptions)
                    .json({
                        message: "userlogged in succesfully",
                        tokens: { accessToken },
                        user: {
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
            } else {
                const err = new Error("getting userInfo via access token failed");
                err.status = 400;
                err.extraDetails = "from loginWithGoogleCode function inside authcontroller";
                return next(err);
            }
        }
        const err = new Error("getting accesstoken via code failed");
        err.status = 400;
        err.extraDetails = "from loginWithGoogleCode function inside authcontroller";
        return next(err);
    } catch (error) {
        console.log(error)
        const err = new Error("login with google failed");
        err.status = 400;
        err.extraDetails = "from loginWithGoogleCode function inside authcontroller";
        next(err);
    }
}

const loginWithTwitterCode = async (req, res, next) => {
    const { code: twitterCode, codeVerifier: code_verifier } = req.query;
    try {
        const twitterCodeRequestUrl = "https://api.twitter.com/2/oauth2/token";
        const twitterCodeRequestData = qs.stringify({
            'code': `${twitterCode}`,
            'client_id': process.env.TWITTER_CLIENT_ID,
            'redirect_uri': process.env.TWITTER_REDIRECT_URI,
            'grant_type': 'authorization_code',
            code_verifier
        })
        const encodedCredentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');

        const responseOfTwitterCodeRequest = await axios.post(
            twitterCodeRequestUrl, twitterCodeRequestData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedCredentials}`
            }
        }
        )

        if (responseOfTwitterCodeRequest.status === 200) {
            console.log(responseOfTwitterCodeRequest.data);
            const responseOfuserDataFetch = await axios.get("https://api.twitter.com/2/users/me", {
                headers: {
                    'Authorization': `Bearer ${responseOfTwitterCodeRequest.data.access_token}`
                }
            })

            //not getting user email so stoppped
            const { id, name: full_name, username: user_name } = responseOfuserDataFetch.data.data
            let user = await User.findOne({ "twitter_data.id": id })
            if (!user) {
                user = await User.create({ full_name, twitter_data: responseOfuserDataFetch.data, account_type: "TWITTER" })
            } else {
                user.full_name = full_name;
                user.twitter_data = responseOfuserDataFetch.data
            }
            if (!user.avatar_url) {
                user.avatar_url = `https://avatar.iran.liara.run/public/boy?username=${full_name}`
            }
            const { accessToken, refreshToken } = generateAccessToken(user);
            user.refresh_token = refreshToken;
            await user.save();
            return res
                .status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .json({
                    message: "userlogged in succesfully",
                    tokens: { accessToken },
                    user: {
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
                })

        }
        res.status(200).json({ message: "received" })

    } catch (error) {
        console.log(error)
        const err = new Error("login with twitter failed");
        err.status = 400;
        err.extraDetails = "from loginWithTwitterCode function inside authcontroller";
        next(err);
    }
}

const loginWithFaceBookCode = async (req, res, next) => {
    try {
        const { code: facebookCode, codeVerifier } = req.query;
        // get access token
        const responseOfaccessTokenFetch = await axios.get(`https://graph.facebook.com/v15.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${facebookCode}&code_verifier=${codeVerifier}`);

        if (responseOfaccessTokenFetch.status === 200) {
            const responseOfUserInforequest = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${responseOfaccessTokenFetch.data.access_token}`);
            if (responseOfaccessTokenFetch.status === 200) {
                const { name: full_name, email, picture } = responseOfUserInforequest.data
                let user = await User.findOne({ email });
                if (picture.data.is_silhouette) {
                    picture.data.url = `https://avatar.iran.liara.run/public/boy?username=${full_name}`
                }
                if (!user) {
                    user = await User.create({
                        full_name,
                        email,
                        avatar_url: picture.data.url,
                        account_type: "FACEBOOK",
                        facebook_data: responseOfUserInforequest.data
                    })
                } else {
                    user.avatar_url = picture.data.url
                    user.full_name = full_name
                }
                const { accessToken, refreshToken } = generateAccessToken(user);
                user.refresh_token = refreshToken;
                user.save();
                return res
                    .status(200)
                    .cookie("accessToken", accessToken, cookieOptions)
                    .json({
                        message: "userlogged in succesfully",
                        tokens: { accessToken },
                        user: {
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
            }
        }

        const err = new Error("something happend with backend");
        err.status = 400;
        err.extraDetails = "from loginWithfacebookCode function inside authcontroller";
        return next(err);
    } catch (error) {
        console.log(error)
        const err = new Error("login with facebook failed");
        err.status = 400;
        err.extraDetails = "from loginWithfacebookCode function inside authcontroller";
        next(err);

    }

}

module.exports = { loginWithChitii, signup, logout, loginWithGoogleCode, loginWithTwitterCode, loginWithFaceBookCode };