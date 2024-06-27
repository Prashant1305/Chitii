const Conversation = require("../models/conversation_model");
const Message = require("../models/message_model");
const User = require("../models/user_model");
const mongoose = require('mongoose');
const { emitEvent } = require("../utils/features");
const { ALERT, REFETCH_CHATS } = require("../Constants/events");
const { ObjectId } = require('mongodb');

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
        err.extraDetails = "from sendMessage function inside chat_controller";
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
        err.extraDetails = "from getMessage function inside chat_controller";
        next(err);
    }
}

const newGroupChat = async (req, res, next) => {
    try {
        const { name, members } = req.body;
        if (members.length < 2) {
            const err = new Error(`cannot create group of ${members.length} members`);
            err.status = 400;
            err.extraDetails = "from newGroupChat function inside chat_controller";
            return next(err);

        }
        const allMembers = [...members, req.clientAuthData._id]
        console.log(allMembers)
        const temp = await Conversation.create({ name, group_chat: true, members: allMembers, creator: req.clientAuthData._id });
        // console.log(temp);
        emitEvent(req, ALERT, allMembers, `welcome to ${name} group`);
        emitEvent(req, REFETCH_CHATS, members);

        return res.status(201).json({ message: "Grouop created successfully" });

    } catch (error) {
        const err = new Error("cannot create group, plz try later");
        err.status = 400;
        err.extraDetails = "from newGroupChat function inside chat_controller";
        next(err);
    }
}

const getMyChats = async (req, res, next) => {
    try {
        let chats = await Conversation.find({ members: req.clientAuthData._id }).populate("members", "avatar_url");

        console.log(req.clientAuthData._id)
        let modifiedchats = chats.map((singleChat) => {

            const temp = singleChat.members.filter((member) => {
                return ("" + req.clientAuthData._id !== "" + member._id)
            });

            return { _id: singleChat._id, name: singleChat.name, group_chat: singleChat.group_chat, creator: singleChat.creator, members: temp };
        })
        return res.status(200).json({
            message: modifiedchats
        });
    } catch (error) {
        const err = new Error("cannot retrive chats, plz try later");
        err.status = 400;
        err.extraDetails = "from getMyChats function inside chat_controller";
        next(err);
    }
}

const getMyGroups = async (req, res, next) => {
    try {
        const chats = await Conversation.find({
            members: req.clientAuthData._id,
            group_chat: true,
            creator: req.clientAuthData._id
        }).populate("members", "avatar_url");

        const modifiedchats = chats.map((singleChat) => {

            const temp = singleChat.members.filter((member) => {
                return ("" + req.clientAuthData._id !== "" + member._id)
            });

            return { _id: singleChat._id, name: singleChat.name, group_chat: singleChat.group_chat, creator: singleChat.creator, members: temp };
        })
        res.status(200).json({ message: modifiedchats })


    } catch (error) {
        const err = new Error("cannot retrive my group chat, plz try later");
        err.status = 400;
        err.extraDetails = "from getMyGroups function inside chat_controller";
        next(err);
    }
}

const addMembers = async (req, res, next) => {
    try {
        const { conversationId, members } = req.body;
        const chat = await Conversation.findById(conversationId);
        if (!chat) {
            return res.status(400).json({ message: "Conversation not found" });
        }
        if (!members || members.length < 1) {
            return res.status(400).json({ message: "plz select members" });
        }
        if (!chat.group_chat) {
            return res.status(400).json({ message: "This is no a group chat" })
        }
        if (chat.creator.toString() !== req.clientAuthData._id.toString()) {
            return res.status(400).json({ message: "Only group creator can add members" });
        }

        const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
        const allNewMembers = await Promise.all(allNewMembersPromise);
        const uniqueMembers = allNewMembers.filter((i) => !chat.members.includes(i._id.toString()))
        chat.members.push(...uniqueMembers.map((i) => i._id));

        await chat.save();

        const allUsersName = allNewMembers.map((i) => i.name).join(",");

        emitEvent(req, ALERT, chat.members, `new member has been added to ${chat.name} by ${req.clientAuthData.user_name}`)
        emitEvent(req, REFETCH_CHATS, chat.members);
        res.status(200).json({ message: "members added successfully" });

    } catch (error) {
        const err = new Error("cannot add member, plz try later");
        err.status = 400;
        err.extraDetails = "from addMembers function inside chat_controller";
        next(err);
    }
}

const removeMembers = async (req, res, next) => { // incomplete
    try {
        const { userId, conversationId } = req.body;
        if (!conversationId) {
            return res.status(400).json({ message: "Conversation not found" });
        }
        if (!userId || userId.length === 0) {
            return res.status(400).json({ message: "plz select userId" });
        }

        const chat = await Conversation.findById(conversationId);

        if (chat.creator.toString() !== req.clientAuthData._id.toString()) {
            return res.status(400).json({ message: "Only group creator can remove members" });
        }

        const modifiedMember = chat.members.filter((member) => !userId.includes(member._id.toString()));
        chat.members = [...modifiedMember];

        if (chat.members.length < 3) {
            return res.status(400).json({ message: "minimum 3 members are needed in a group" });
        }

        chat.save();
        emitEvent(req, REFETCH_CHATS, chat.members);
        res.status(200).json({ message: "members removed successfully" });


    } catch (error) {
        const err = new Error("cannot remove members, plz try later");
        err.status = 400;
        err.extraDetails = "from removeMembers function inside chat_controller";
        next(err);
    }
}

const leaveGroup = async (req, res, next) => {
    try {
        const chatId = req.params.id;

        const chat = await Conversation.findById(chatId);

        if (!chat) {
            return res.status(400).json({ message: "Chat not found" });
        }
        if (!chat.group_chat) {
            return res.status(400).json({ message: "user can't leave personal chat" })
        }
        chat.members = chat.members.filter((member) => member.toString() !== req.clientAuthData._id.toString())
        if (chat.creator === req.clientAuthData._id) {
            chat.creator = chat.members[0];
        }
        chat.save();
        emitEvent(req, ALERT, chat.members, `${req.clientAuthData.user_name} has leaved ${chat.name}`)
        res.status(200).json({ message: "Group leaved successfully" });

    } catch (error) {
        const err = new Error("cannot leave Groups, plz try later");
        err.status = 400;
        err.extraDetails = "from leaveGroup function inside chat_controller";
        next(err);
    }
}

module.exports = { sendMessage, getMessages, newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup };