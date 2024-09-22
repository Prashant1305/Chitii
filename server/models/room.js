const mongoose = require("mongoose");
const User = require("./user_model");

const roomsSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: User
        }
    ],
},
    { timestamps: true }
)

const Room = mongoose.model("Room", roomsSchema);

module.exports = Room;