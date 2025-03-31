const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user_id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // Recipient of the notification
        }],
        type: {
            type: String,
            enum: ["friend_request", "new_message", "info"],
            required: true,
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // Who triggered the notification
        },
        message: {
            type: String, // Message preview (if type is 'new_message')
        },
        chat_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            required: function () {
                return this.type === 'friend_request';
            }
        },
        status: {
            type: String,
            enum: ["unread", "read"],
            default: "unread",
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
