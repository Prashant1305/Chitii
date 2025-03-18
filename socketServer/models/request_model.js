const mongoose = require("mongoose");
const User = require("./user_model");
const Conversation = require("./conversation_model")

const requestSchema = new mongoose.Schema({
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"]
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    }
},
    { timestamps: true }
)

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;