const mongoose = require('mongoose');
const User = require('./user_model');

const conversationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    conversation_type: {
        type: String,
        default: "group",
        enum: ["private", "group"]
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: User
        }
    ],

}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation