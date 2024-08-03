const Conversation = require("../../models/conversation_model");
const Message = require("../../models/message_model");
const User = require("../../models/user_model");


const allUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).lean();
        const transformedUsers = await Promise.all(
            users.map(async ({ _id, avatar_url, full_name, user_name }) => {

                const [groups, friends] = await Promise.all([
                    Conversation.countDocuments({ members: _id, group_chat: true }),
                    Conversation.countDocuments({ members: _id, group_chat: false })
                ])
                return ({
                    _id,
                    groups: groups,
                    friends: friends,
                    avatar_url,
                    full_name,
                    user_name
                })
            }))

        res.status(200).json({ message: transformedUsers })
    } catch (error) {
        const err = new Error("unable to get whole users list, plz try later");
        err.status = 501;
        err.extraDetails = "from allUsers function inside admin_controller";
        next(err);
    }
}

const allChats = async (req, res, next) => {
    try {
        const chats = await Conversation.find({})
            .populate("members", "user_name avatar_url")
            .populate("creator", "user_name avatar_url").lean();

        const modifiedChats = await Promise.all(chats.map(async (chat) => {
            const totalMessages = await Message.countDocuments({ conversation: chat._id }).lean()
            return { ...chat, totalMessages }
        }))
        res.status(200).json({ message: modifiedChats })
    } catch (error) {
        const err = new Error("unable to get whole chat list, plz try later");
        err.status = 501;
        err.extraDetails = "from allChats function inside admin_controller";
        next(err);
    }
}

const allMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({})
            .populate("sender", "user_name avatar_url")
            .populate("conversation", "group_chat name");

        const transformedMessages = messages.map(({ _id, attachments, text_content, sender, conversation, createdAt }) => {
            return ({
                _id,
                attachments,
                text_content,
                sender,
                chat: conversation,
                createdAt
            })
        })

        return res.status(200).json({ messages: transformedMessages });
    } catch (error) {
        const err = new Error("unable to get allMessages list, plz try later");
        err.status = 501;
        err.extraDetails = "from allMessages function inside admin_controller";
        next(err);
    }
}

const getDashboardStats = async (req, res, next) => {
    try {
        const [lstSevenDaysChats, groupChatCount, privateChatCount, usersCount, messageCount] = await Promise.all([
            Message.find({
                createdAt: {
                    $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                }
            }).select("createdAt"),
            Conversation.countDocuments({ group_chat: true }),
            Conversation.countDocuments({ group_chat: false }),
            User.countDocuments(),
            Message.countDocuments()
        ]);

        const messageCountofLastSevenDays = new Array(7).fill(0);
        const today = new Date();

        lstSevenDaysChats.forEach((chat) => {
            const index = Math.floor((today.getTime() - chat.createdAt.getTime()) / (24 * 60 * 60 * 1000));
            messageCountofLastSevenDays[6 - index]++;
        })

        res.status(200).json({
            message: {
                messageCountofLastSevenDays,
                groupChatCount, privateChatCount, usersCount, messageCount
            }
        });
    } catch (error) {
        const err = new Error("unable to get DashboardStats list, plz try later");
        err.status = 501;
        err.extraDetails = "from getDashboardStats function inside admin_controller";
        next(err);
    }
}

module.exports = { allUsers, allChats, allMessages, getDashboardStats }