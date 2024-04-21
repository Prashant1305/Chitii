const mongoose = require("mongoose");
const User = require("./user_model");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    message: {
        type: String,
        required: true
    }
},
    { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;