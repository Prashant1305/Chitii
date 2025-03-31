const mongoose = require('mongoose');

const fcmSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference as a string
        required: true, // Ensure every entry has a user
        unique: true,
    },
    tokens: {
        type: [String], // Array of FCM tokens
        default: [],
    },

}, { timestamps: true });

const Fcm = mongoose.model("Fcm", fcmSchema);

module.exports = Fcm