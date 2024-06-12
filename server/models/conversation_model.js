const mongoose = require('mongoose');
const User = require('./user_model');

const conversationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    group_chat: {
        type: Boolean,
        default: false
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