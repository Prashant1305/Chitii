const Conversation = require("../models/conversation_model");
const Message = require("../models/message_model");
const User = require("../models/user_model");
const mongoose = require('mongoose');

const sendMessage = async (req, res, next) => {
    try {

        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.clientAuthData._id;
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "wrong receiver id provided" });
        }
        const receiverExist = await User.findById(receiverId);
        if (!receiverExist) {
            return res.status(400).json({ message: "receiver does not exist" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!conversation) { // if conversation does not exist, then create one
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            })
        }

        const newMessage = new Message({
            senderId, receiverId, message
        })
        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        // await conversation.save();
        // await newMessage.save();
        //since above two promises are independent of each other so we can run them parallely
        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(200).json({ message: "message Successfully sent", newMessage });
    } catch (error) {
        const err = new Error("message transaction failed");
        err.status = 400;
        err.extraDetails = "from sendMessage function inside message_controller";
        next(err);
    }
}

const getMessages = async (req, res, next) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.clientAuthData._id;
        if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ message: "wrong id provided" });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");// via populate command it will replace message refrence with original message
        if (!conversation) {
            return res.status(200).json([]);
        }
        // console.log(conversation);
        res.status(200).json({ message: conversation.messages });
    } catch (error) {
        const err = new Error("cannot retrive message");
        err.status = 400;
        err.extraDetails = "from getMessage function inside message_controller";
        next(err);
    }
}

module.exports = { sendMessage, getMessages }