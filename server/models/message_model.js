const mongoose = require("mongoose");
const User = require("./user_model");
const Conversation = require("./conversation_model");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Conversation,
        required: true
    },
    text_content: {
        type: String,
        default: ""
    },
    attachments: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    ]
},
    { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;