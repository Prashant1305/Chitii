const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateUniqueUserName = async function (full_name) {
    try {
        let uniqueName = full_name.replaceAll(' ', '_');
        let counter = 1;
        while (await User.findOne({ user_name: uniqueName })) {
            uniqueName = uniqueName + counter;
            counter++;
        }
        return uniqueName;
    } catch (error) {
        console.log(error);
    }
};

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    mobile_number: {
        type: Number,
        // required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // required: true,
    },
    bio: {
        type: String,
        default: "Swagat nahi karoge nahi hamara!"
    },
    gender: {
        type: String,
        // required: true
    },
    avatar_url: {
        type: String,
        // required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    refresh_token: {
        type: String
    },
    account_type: {
        type: String,
        default: "CHITII",
        enum: ["CHITII", "GOOGLE", "TWITTER", "FACEBOOK"],
        required: true
    }
},
    { timestamps: true }
);

userSchema.pre("save", async function (next) { // cannot use arrow as "this" value will be undefined here
    if (this.account_type === "CHITII") {
        if (!this.isModified("password"))// since this will always run whenever we save user, even if we don't change password. so we will avoid this, and will encrypt password only if it changes.
        {
            return next();
        }

        const user = this;
        try {
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(user.password, salt);
            user.password = hashedPassword;
            return next();
        } catch (error) {
            const err = new Error("error in encrypting password");
            err.status = 400;
            err.extraDetails = "from user_models inside userschema.pre(save)";
            next(err);
        }
    }
});

// assigning username for loginh with google
userSchema.pre("validate", async function (next) {
    if (this.account_type === "GOOGLE" && !this.user_name) {
        this.user_name = await generateUniqueUserName(this.full_name || "user");
    }
    next();
});

//JWT
userSchema.methods.generateAccessToken = function () { // cannot use arrow as "this" value will be undefined here
    try {
        return jwt.sign({
            _id: this._id.toString(),
            email: this.email
        },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            });
    } catch (error) {
        console.log(error);
    }
};

userSchema.methods.generateRefreshToken = function () { // cannot use arrow as "this" value will be undefined here
    try {
        return jwt.sign({
            _id: this._id.toString(),
            email: this.email
        },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            });
    } catch (error) {
        console.log(error);
    }
};

//password verificaton
userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcryptjs.compare(password, this.password);
    } catch (error) {
        const err = new Error("failed to check");
        err.status = 400;
        err.extraDetails = "from user models inside isPassword correct";
        next(error);
    }

};


const User = mongoose.model("User", userSchema);
module.exports = User;