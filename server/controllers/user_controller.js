const Conversation = require("../models/conversation_model");
const User = require("../models/user_model");
const Request = require("../models/request_model");
const { NEW_REQUEST, REFETCH_CHATS, NEW_FRIEND_REQUEST } = require("../Constants/events");
const { redis } = require("../utils/redis/connectToRedis");
const { REDIS_ONLINE_USERS_ID_MAPPED_WITH_SOCKET_ID } = require("../Constants/constants");
const { findUserConnectedToAndSendSocketEventToRabbit } = require("../utils/helper");
const Notification = require("../models/notification_model");


const getMyProfile = async (req, res, next) => {
    try {
        const { _id, full_name, user_name, mobile_number, email, bio, gender, friends, preferred_online_status, avatar_url, isAdmin, account_type } = req.clientAuthData
        res.status(200).json({
            message: { _id, full_name, user_name, mobile_number, email, bio, gender, friends, preferred_online_status, avatar_url, isAdmin, account_type }
        });
    }
    catch (error) {
        const err = new Error("unable to fetch MyProfile");
        err.status = 400;
        err.extraDetails = "from getMyProfile function inside user_controller";
        next(err);
    }
}

const searchUser = async (req, res, next) => {
    try {
        const { name = "" } = req.query;

        const allusersExceptMeAndMyFriends = await User.find({
            _id: { $nin: [...req.clientAuthData.friends, req.clientAuthData._id] },
            user_name: { $regex: name, $options: "i" }, // matching pattern with insenistive case
            full_name: { $regex: name, $options: "i" },
        });
        const users = allusersExceptMeAndMyFriends.map((i) => ({ _id: i._id, name: i.user_name, full_name: i.full_name, avatar_url: i.avatar_url }))

        res.status(200).json({ message: users });
    } catch (error) {
        const err = new Error("unable to Search user, plz try later");
        err.status = 501;
        err.extraDetails = "from searchUser function inside user_controller";
        next(err);
    }
}

const sendFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const request = await Request.findOne({
            $or: [
                { sender: req.clientAuthData._id, receiver: userId },
                { sender: userId, receiver: req.clientAuthData._id }
            ],
            status: "pending"
        });

        if (request) {
            return res.status(201).json({ message: "request already exist" });
        }

        const newRequest = await Request.create({ sender: req.clientAuthData._id, receiver: userId });

        await Notification.create({ // create notification
            user_id: userId,
            type: "friend_request",
            from: req.clientAuthData._id,
            message: `friend request from ${req.clientAuthData.user_name}`,
            request: newRequest._id
        });

        await findUserConnectedToAndSendSocketEventToRabbit([userId], {
            user_name: req.clientAuthData.user_name,
            event_name: NEW_FRIEND_REQUEST
        });

        return res.status(200).json({ message: "Friend request sent succesfully" });

    } catch (error) {
        console.dir(error)
        const err = new Error("unable to send request, plz try later");
        err.status = 501;
        err.extraDetails = "from sendFriendRequest function inside user_controller";
        next(err);
    }
}

const acceptFriendRequest = async (req, res, next) => {
    try {
        const { requestId, accept } = req.body;

        const request = await Request.findById(requestId).populate("sender", "user_name").populate("receiver", "user_name");

        if (!request) {
            return res.status(400).json({ message: "No request found" });
        }

        if (request.receiver._id.toString() !== req.clientAuthData._id.toString()) {
            return res.status(400).json({ message: "You are not allowed to modify request" });
        }

        if (!accept) {
            request.status = "rejected";
            return res.status(200).json({ message: "friend request declined" });
        }

        request.status = "accepted";
        req.clientAuthData.friends.push(requestId);
        const members = [request.sender._id, request.receiver._id];
        //create Conversation
        const chat = await Conversation.create({ members: members, name: request.sender.user_name + "-" + request.receiver.user_name });


        await Promise.all([
            request.save(),// updated request

            User.findByIdAndUpdate(request.receiver._id,
                { $push: { friends: request.sender._id } }
            ), // updated receiver friends list

            User.findByIdAndUpdate(request.sender._id,
                { $push: { friends: request.receiver._id } }
            ),// updated sender friends list

            await findUserConnectedToAndSendSocketEventToRabbit(members, {
                event_name: REFETCH_CHATS
            }), // everyone refresh their chat

            Notification.create({ // create notification 
                user_id: request.sender._id,
                type: "info",
                from: req.clientAuthData._id,
                message: `friend request accepted by ${req.clientAuthData.user_name}`,
                chat_id: chat._id,
            }),
        ]);

        res.status(200).json({ message: `you are now friends with ${request.sender.user_name}` });
    } catch (error) {
        console.log(error)
        const err = new Error("unable to accept friend request, plz try later");
        err.status = 501;
        err.extraDetails = "from acceptFriendRequest function inside user_controller";
        next(err);
    }
}

const removeFriend = async (req, res, next) => {
    try {
        let { chatId, friendId } = req.query;

        if (friendId) {
            // checking wether friendId provided is in list of your firend or not
            if (!req.clientAuthData.friends.some((friend) => friend + "" === friendId + "")) {
                return res.status(400).json({ message: `${id} is not your friend` });
            }

        } else { // for chatId
            const conversation = await Conversation.findById(chatId);
            if (!conversation) {
                return res.status(404).json({ message: "conversation not found" });
            }
            friendId = conversation.members.filter((ids) => {
                return ids + "" !== req.clientAuthData._id + ""
            })[0];
        }


        req.clientAuthData.friends = req.clientAuthData.friends.filter((id) => {
            return friendId + "" !== id + ""
        });

        const temp = await Promise.all([
            req.clientAuthData.save(),
            // updating friends friendList
            await User.findByIdAndUpdate(
                friendId,
                { $pull: { friends: req.clientAuthData._id } },
                { new: true }
            )
        ]);

        return res.status(200).json({ message: "friend removed succesfully" });

    } catch (error) {
        console.log(error)
        const err = new Error("unable to remove friend, plz try later");
        err.status = 501;
        err.extraDetails = "from removeFriend function inside user_controller";
    }
}

const getAllNotifications = async (req, res, next) => {
    try {
        // Retrieve pagination values from query parameters, defaulting to page 1 and limit 10
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Find notifications for the given user, sort by 'date' field in descending order, and apply pagination
        const notifications = await Notification.find({ user_id: req.clientAuthData._id })
            .populate('from', 'user_name avatar_url')
            .sort({ date: -1 })   // sort by date in descending order
            .skip(skip)           // skip the first (page - 1) * limit documents
            .limit(limit)
            .lean();

        res.status(200).json({ message: notifications });

        await Promise.all(notifications.map((noti) =>
            Notification.findByIdAndUpdate(noti._id,
                { $set: { status: "read" } })
        ));
    } catch (error) {
        console.log(error)
        const err = new Error("unable to retrive notification, plz try later");
        err.status = 501;
        err.extraDetails = "from getAllNotifications function inside user_controller";
        next(err);
    }
}

const getMyfriends = async (req, res, next) => {
    try {
        const { conversationId } = req.query;
        const chats = await Conversation.find({ members: req.clientAuthData._id, conversation_type: private }).lean().populate("members", "user_name avatar_url")

        const friends = chats.map((chat) => chat.members).flat().filter((member) => member._id.toString() !== req.clientAuthData._id.toString());

        if (conversationId) {
            const chat = await Conversation.findById(conversationId);

            const friendsNotInChat = friends.filter((friend) => {

                for (let i = 0; i < chat.members.length; i++) {
                    if (chat.members[i].toString() === friend._id.toString()) {
                        return false;
                    }
                }
                return true;
            });
            return res.status(200).json({ message: friendsNotInChat });
        }

        res.status(200).json({ message: friends });
    } catch (error) {
        const err = new Error("unable to retrive friend list, plz try later");
        err.status = 501;
        err.extraDetails = "from getMyfriends function inside user_controller";
        next(err);
    }
}

const getAllOnlineFriends = async (req, res, next) => {
    try {
        // const chats = await Conversation.find({ members: req.clientAuthData._id, group_chat: false }).select("members").lean();

        // const friends = chats.map((chat) => chat.members).flat().filter((member) => member._id.toString() !== req.clientAuthData._id.toString());

        const friends = req.clientAuthData.friends.map((friend) => friend + "");
        const onlineFriendIds = [];

        await Promise.all(
            friends.map(async (userId) => {
                const exists = await redis.hexists(REDIS_ONLINE_USERS_ID_MAPPED_WITH_SOCKET_ID, userId);
                if (exists) {
                    onlineFriendIds.push(userId);
                }
            })
        );
        res.status(200).json({ message: onlineFriendIds })

    } catch (error) {
        console.log(error)
        const err = new Error("unable to retrive online friend list, plz try later");
        err.status = 501;
        err.extraDetails = "from getAllOnlineFriends function inside user_controller";
        next(err);
    }
}

module.exports = { getMyProfile, searchUser, sendFriendRequest, acceptFriendRequest, getAllNotifications, getMyfriends, getAllOnlineFriends, removeFriend }