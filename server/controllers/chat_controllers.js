const Conversation = require("../models/conversation_model");
const Message = require("../models/message_model");
const User = require("../models/user_model");
const mongoose = require('mongoose');

const { REFETCH_CHATS, NEW_MESSAGE } = require("../Constants/events");
const { ObjectId } = require('mongodb');
const { uploadOnCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryDb/cloudinary");
const { pub } = require("../utils/redis/connectToRedis");

// const sendMessage = async (req, res, next) => {
//     try {

//         const { message } = req.body;
//         const { id: receiverId } = req.params;
//         const senderId = req.clientAuthData._id;
//         if (!mongoose.Types.ObjectId.isValid(receiverId)) {
//             return res.status(400).json({ message: "wrong receiver id provided" });
//         }
//         const receiverExist = await User.findById(receiverId);
//         if (!receiverExist) {
//             return res.status(400).json({ message: "receiver does not exist" });
//         }

//         let conversation = await Conversation.findOne({
//             participants: { $all: [senderId, receiverId] }
//         })

//         if (!conversation) { // if conversation does not exist, then create one
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId],
//             })
//         }

//         const newMessage = new Message({
//             senderId, receiverId, message
//         })
//         if (newMessage) {
//             conversation.messages.push(newMessage._id);
//         }

//         // await conversation.save();
//         // await newMessage.save();
//         //since above two promises are independent of each other so we can run them parallely
//         await Promise.all([conversation.save(), newMessage.save()]);

//         res.status(200).json({ message: "message Successfully sent", newMessage });
//     } catch (error) {
//         const err = new Error("message transaction failed");
//         err.status = 400;
//         err.extraDetails = "from sendMessage function inside chat_controller";
//         next(err);
//     }
// }

// const getMessages = async (req, res, next) => {
//     try {
//         const { id: userToChatId } = req.params;
//         const senderId = req.clientAuthData._id;
//         if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
//             return res.status(400).json({ message: "wrong id provided" });
//         }

//         const conversation = await Conversation.findOne({
//             participants: { $all: [senderId, userToChatId] },
//         }).populate("messages");// via populate command it will replace message refrence with original message
//         if (!conversation) {
//             return res.status(200).json([]);
//         }
//         // console.log(conversation);
//         res.status(200).json({ message: conversation.messages });
//     } catch (error) {
//         const err = new Error("cannot retrive message");
//         err.status = 400;
//         err.extraDetails = "from getMessage function inside chat_controller";
//         next(err);
//     }
// }

const newGroupChat = async (req, res, next) => {
    try {
        const { name, members } = req.body;
        if (members.length < 2) {
            const err = new Error(`cannot create group of ${members.length} members`);
            err.status = 400;
            err.extraDetails = "from newGroupChat function inside chat_controller";
            return next(err);

        }
        const allMembers = [...members, req.clientAuthData._id.toString()]
        const newGroup = await Conversation.create({ name, group_chat: true, members: allMembers, creator: req.clientAuthData._id });
        // console.log(newGroup);

        const messageForDb = { sender: req.clientAuthData._id, conversation: newGroup._id, text_content: `Group Created by ${req.clientAuthData.user_name}`, attachments: [] }

        const dbMessageSaved = await Message.create(messageForDb);

        const messageNotification = {
            sender: { _id: req.clientAuthData._id, name: req.clientAuthData.user_name },
            conversation: messageForDb.conversation, text_content: messageForDb.text_content, attachments: messageForDb.attachments, _id: dbMessageSaved._id, createdAt: dbMessageSaved.createdAt, updatedAt: dbMessageSaved.updatedAt
        }

        pub.publish(NEW_MESSAGE, JSON.stringify({ members: allMembers, messageNotification }));
        pub.publish(REFETCH_CHATS, JSON.stringify({ members: allMembers }));

        return res.status(200).json({ message: "Grouop created successfully" });

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

        // console.log(req.clientAuthData._id)
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

        const allNewMembersPromise = members.map((i) => User.findById(i, "user_name"));
        const allNewMembers = await Promise.all(allNewMembersPromise);
        const uniqueMembers = allNewMembers.filter((i) => !chat.members.includes(i._id.toString()))
        chat.members.push(...uniqueMembers.map((i) => i._id));

        await chat.save();

        const allUsersName = allNewMembers.map((i) => i.user_name).join(",");


        const messageForDb = { sender: req.clientAuthData._id, conversation: conversationId, text_content: ` ${req.clientAuthData.user_name} added ${allUsersName}`, attachments: [] }

        const dbMessageSaved = await Message.create(messageForDb);

        const messageNotification = {
            sender: { _id: req.clientAuthData._id, name: req.clientAuthData.user_name },
            conversation: messageForDb.conversation, text_content: messageForDb.text_content, attachments: messageForDb.attachments, _id: dbMessageSaved._id, createdAt: dbMessageSaved.createdAt, updatedAt: dbMessageSaved.updatedAt
        }

        const allMembers = chat.members.filter((member) => (member + "" !== req.clientAuthData._id + ""))
        const modifiedAllMember = allMembers.map((member) => (member.toString()));

        // const io = req.app.get('socketio'); // Retrieve io instance from app

        pub.publish(REFETCH_CHATS, JSON.stringify({ members }));
        pub.publish(NEW_MESSAGE, JSON.stringify({ members: modifiedAllMember, messageNotification }))

        res.status(200).json({ message: "members added successfully" });

    } catch (error) {
        const err = new Error("cannot add member, plz try later");
        err.status = 400;
        err.extraDetails = "from addMembers function inside chat_controller";
        next(err);
    }
}

const removeMembers = async (req, res, next) => {
    try {
        const { userId, conversationId } = req.body;
        if (!conversationId) {
            return res.status(400).json({ message: "ConversationId not found" });
        }
        if (!userId || userId.length === 0) {
            return res.status(400).json({ message: "plz select user" });
        }

        const chat = await Conversation.findById(conversationId);
        if (!chat) {
            return res.status(400).json({ message: "Conversation not found" });
        }

        if (chat.creator.toString() !== req.clientAuthData._id.toString()) {
            return res.status(400).json({ message: "Only group creator can remove members" });
        }
        if (userId.includes(chat.creator)) {
            return res.status(400).json({ message: "Group creator can only leave & can't be removed" });
        }

        const modifiedMember = chat.members.filter((member) => !userId.includes(member._id.toString()));
        chat.members = [...modifiedMember];

        if (chat.members.length < 3) {
            return res.status(400).json({ message: "minimum 3 members are needed in a group" });
        }

        chat.save();

        const removedUser = await User.findById(userId).select({ user_name: 1 });

        const messageForDb = { sender: req.clientAuthData._id, conversation: conversationId, text_content: ` ${req.clientAuthData.user_name} removed ${removedUser.user_name}`, attachments: [] }

        const dbMessageSaved = await Message.create(messageForDb);

        const messageNotification = {
            sender: { _id: req.clientAuthData._id, name: req.clientAuthData.user_name },
            conversation: messageForDb.conversation, text_content: messageForDb.text_content, attachments: messageForDb.attachments, _id: dbMessageSaved._id, createdAt: dbMessageSaved.createdAt, updatedAt: dbMessageSaved.updatedAt
        }

        const allMembers = modifiedMember.filter((member) => (member + "" !== req.clientAuthData._id + ""))

        pub.publish(NEW_MESSAGE, JSON.stringify({ members: allMembers, messageNotification }));
        pub.publish(REFETCH_CHATS, JSON.stringify({ members: [userId] }));

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
        if (!chat.members.some(((member) => member._id + "" === req.clientAuthData._id + ""), req.clientAuthData._id)) {
            return res.status(400).json({ message: "you are already not in this group" });
        }
        chat.members = chat.members.filter((member) => member.toString() !== req.clientAuthData._id.toString())
        if (chat.members.length < 3) {
            return res.status(400).json({ message: "minimum 3 members are needed in a group" });
        }
        if (chat.creator + "" === req.clientAuthData._id + "") {
            chat.creator = chat.members[0];
        }
        chat.save();

        const messageForDb = { sender: req.clientAuthData._id, conversation: chatId, text_content: ` ${req.clientAuthData.user_name} left this group`, attachments: [] }

        const dbMessageSaved = await Message.create(messageForDb);

        const messageNotification = {
            sender: { _id: req.clientAuthData._id, name: req.clientAuthData.user_name },
            conversation: messageForDb.conversation, text_content: messageForDb.text_content, attachments: messageForDb.attachments, _id: dbMessageSaved._id, createdAt: dbMessageSaved.createdAt, updatedAt: dbMessageSaved.updatedAt
        }

        const allMembers = chat.members.filter((member) => (member + "" !== req.clientAuthData._id + ""))
        const modifiedAllMember = allMembers.map((id) => id.toString());

        await pub.publish(NEW_MESSAGE, JSON.stringify({ members: modifiedAllMember, messageNotification }))
        await pub.publish(REFETCH_CHATS, JSON.stringify({ members: [req.clientAuthData._id.toString()] }))

        res.status(200).json({ message: "Group leaved successfully" });

    } catch (error) {
        const err = new Error("cannot leave Groups, plz try later");
        err.status = 400;
        err.extraDetails = "from leaveGroup function inside chat_controller";
        next(err);
    }
}

const sendMessage = async (req, res, next) => {
    try {
        const { conversationId, text_content } = req.body;
        const files = req.files || [];

        const chat = await Conversation.findById(conversationId);
        if (!chat) {
            // console.log(chat)
            return res.status(400).json({ message: "Chat not found" })
        }

        if (chat.members.some((member) => (member + "" === req.clientAuthData._id + ""))) {
            const responsePromiseArray = req.files.map((file) => uploadOnCloudinary(file.path))
            const fileUrlArray = await Promise.all(responsePromiseArray);

            const attachments = fileUrlArray.map((file) => {
                return {
                    public_id: file.public_id,
                    url: file.secure_url
                }
            })

            const messageForDb = { sender: req.clientAuthData._id, conversation: conversationId, text_content, attachments }

            const dbMessageSaved = await Message.create(messageForDb);

            const messageNotification = { sender: { _id: req.clientAuthData._id, user_name: req.clientAuthData.user_name, avatar_url: req.clientAuthData.avatar_url }, conversation: conversationId, text_content, attachments, _id: dbMessageSaved._id, createdAt: dbMessageSaved.createdAt, updatedAt: dbMessageSaved.updatedAt }

            pub.publish(NEW_MESSAGE, JSON.stringify({ messageNotification, members: chat.members }));

            // const io = req.app.get('socketio'); // if you want to Retrieve instance from app

            res.status(200).json({ message: "received send message", text_data: req.body, attachments })
        } else {
            res.status(400).json({ message: "you are not allowed to send text message here" })
        }


    } catch (error) {
        const err = new Error("cannot send message, plz try later");
        err.status = 500;
        err.extraDetails = "from sendeMessage function inside chat_controller";
        next(err);
    }
}

const getChatDetails = async (req, res, next) => {
    try {
        if (req.query.populate === "true") {
            const chat = await Conversation.findById(req.params.id).populate("members", "user_name avatar_url")

            if (!chat) {
                return res.status(400).json({ message: "Conversation not found" });
            } else if (!chat.members.some(((member) => member._id + "" === req.clientAuthData._id + ""), req.clientAuthData._id)) {
                return res.status(269).json({ message: "you are not member of this group" });
            }
            return res.status(200).json({ message: chat });

        } else {
            const chat = await Conversation.findById(req.params.id)

            if (!chat) {
                return res.status(400).json({ message: "Conversation not found" });
            } else if (!chat.members.some(((member) => member._id + "" === req.clientAuthData._id + ""), req.clientAuthData._id)) {
                return res.status(269).json({ message: "you are not member of this group" });
            }
            return res.status(200).json({ message: chat });
        }
    } catch (error) {
        const err = new Error("cannot get chat Detials, plz try later");
        err.status = 400;
        err.extraDetails = "from getChatDeatils function inside chat_controller";
        next(err);
    }
}

const renameConversation = async (req, res, next) => {
    try {
        const { conversationId, conversationName } = req.body;
        const chat = await Conversation.findById(conversationId);

        if (!chat?.group_chat) {
            return res.status(400).json({ message: "can't rename personal chat" });
        }
        else if ("" + chat.creator !== req.clientAuthData._id + "") {
            return res.status(400).json({ message: "Only admin can change name" });
        }
        chat.name = conversationName;
        await chat.save();

        pub.publish(REFETCH_CHATS, JSON.stringify({ members: chat.members }))

        // const io = req.app.get('socketio'); // Retrieve io instance from app
        return res.status(200).json({ message: "Group name changed succesfully" });
    } catch (error) {
        const err = new Error("cannot rename chat, plz try later");
        err.status = 400;
        err.extraDetails = "from renameConversation function inside chat_controller";
        next(err);
    }
}

const deleteChat = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        const chat = await Conversation.findById(conversationId);
        if (!chat) {
            return res.status(400).json({ message: "No chat found" });
        }

        if (chat.group_chat && "" + chat.creator !== req.clientAuthData._id + "") {
            return res.status(400).json({ message: "Only admin can delete chat" });
        }
        else if (!chat.group_chat && !chat.members.includes(req.clientAuthData._id.toString())) {
            return res.status(400).json({ message: "you are not allowed to delete the chat" });
        }
        // deleting messages of chat
        const messagesOfDeletingConversation = await Message.find({ conversation: conversationId });

        messagesOfDeletingConversation?.forEach(async (message) => {
            if (message.attachments.length) {
                message.attachments.forEach(async (attachment) => {
                    await deleteFromCloudinary(attachment.public_id);
                })
            }
            await Message.deleteOne({ _id: message._id })
        })
        await Conversation.deleteOne({ _id: conversationId })

        pub.publish(REFETCH_CHATS, JSON.stringify({ members: chat.members }))

        return res.status(200).json({ message: "Chat deleted succesfully" });

    } catch (error) {
        const err = new Error("cannot delete chat, plz try later");
        err.status = 400;
        err.extraDetails = "from deleteChat function inside chat_controller";
        next(err);
    }
}

const getMessages = async (req, res, next) => {
    try {
        const chatId = req.params.id;

        const wantedChat = await Conversation.findById(chatId);
        if (!wantedChat?.members.some((member) => (member + "" !== req.clientAuthData._id + ""))) {
            return res.status(400).json({ message: "you are not allowed to access the chat" });
        }
        const { page = 1 } = req.query;

        const limit = 20; // no. of messages per page
        const skip = (page - 1) * limit;

        const [messages, totalMessagesCount] = await Promise.all([
            Message.find({ conversation: chatId })
                .sort({ createdAt: -1 }) // descending order
                .skip(skip)
                .limit(limit)
                .populate("sender", "user_name")
                .lean(),
            Message.countDocuments({ conversation: chatId }),
        ])
        const totalPages = Math.ceil(totalMessagesCount / limit) || 0;
        return res.status(200).json({ messages: messages.reverse(), totalPages });

    } catch (error) {
        const err = new Error("messages can't be retrived, plz try later");
        err.status = 400;
        err.extraDetails = "from getMessages function inside chat_controller";
        next(err);
    }
}

const getSingleMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id)
        const message = await Message.findById(id).populate("sender", "user_name").lean();
        if (!message) {
            return res.status(400).json({ message: "message not found" });
        }
        res.status(200).json({ message });
    } catch (error) {
        const err = new Error("messages can't get your single message, plz try later");
        err.status = 500;
        err.extraDetails = "from getMessages function inside chat_controller";
        next(err);
    }
}

module.exports = { newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, sendMessage, getChatDetails, renameConversation, deleteChat, getMessages, getSingleMessage };