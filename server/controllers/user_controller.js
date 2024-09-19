const Conversation = require("../models/conversation_model");
const User = require("../models/user_model");
const Request = require("../models/request_model");
const { emitEvent } = require("../utils/features");
const { NEW_REQUEST, REFETCH_CHATS } = require("../Constants/events");
const { getSockets } = require("../utils/helper");
const { InstanceActiveUserSocketIDs } = require("../utils/infoOfActiveSession");


// const getUserForSidebar = async (req, res, next) => {
//     try {
//         const loggedInUserId = req.clientAuthData._id;
//         const recentConversationUserFullDetails = await Conversation.find({ participants: loggedInUserId }).select({ participants: 1 }).populate("participants");

//         const requiredDetails = recentConversationUserFullDetails.map((conversation) => {
//             let temp = [];
//             if (conversation.participants.length > 0) {
//                 temp = conversation.participants.map((user) => {
//                     return { _id: user._id, full_name: user.full_name, user_name: user.user_name, email: user.email, avatar_url: user.avatar_url, gender: user.gender }
//                 })
//             }
//             return temp;
//         });
//         res.status(200).json({ message: requiredDetails });

//     } catch (error) {
//         const err = new Error("unable to get sidebar");
//         err.status = 400;
//         err.extraDetails = "from getUserForSidebar function inside user_controller";
//         next(err);
//     }
// }

const getMyProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            message: req.clientAuthData
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
        console.log(req.clientAuthData._id.toString())
        const myChats = await Conversation.find({ group_chat: false, members: req.clientAuthData._id.toString() });

        const allUsersFromMyChats = myChats.map((chat) => chat.members).flat();
        // console.log(allUsersFromMyChats)
        const allusersExceptMeAndMyFriends = await User.find({
            _id: { $nin: allUsersFromMyChats },
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
            ]
        });
        // console.log(request)

        if (request) {
            return res.status(400).json({ message: "request already sent" });
        }

        await Request.create({ sender: req.clientAuthData._id, receiver: userId });

        // emitEvent(req, NEW_REQUEST, [userId]);

        const io = req.app.get('socketio'); // Retrieve io instance from app
        const memberSocket = InstanceActiveUserSocketIDs.get(userId);
        if (memberSocket.length > 0) {
            io.to(memberSocket).emit(NEW_REQUEST, { msg: `you received freind request from ${req.clientAuthData.user_name}` });
        }

        return res.status(200).json({ message: "Friend request sent succesfully" });

    } catch (error) {
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
            await request.deleteOne();
            return res.status(200).json({ message: "friend request declined" });
        }


        const members = [request.sender._id, request.receiver._id];
        await Promise.all([
            Conversation.create({
                members,
                name: `${request.sender.user_name}-${request.receiver.user_name}`
            })
        ])

        // emitEvent(req, REFETCH_CHATS, members);

        await request.deleteOne();
        res.status(200).json({ message: `you are now friends with ${request.sender.user_name}` });
    } catch (error) {
        const err = new Error("unable to accept friend request, plz try later");
        err.status = 501;
        err.extraDetails = "from acceptFriendRequest function inside user_controller";
        next(err);
    }
}

const getAllNotifications = async (req, res, next) => {
    try {
        const requests = await Request.find({ receiver: req.clientAuthData._id }).populate(
            "sender",
            "user_name avatar_url"
        )

        res.status(200).json({ message: requests });
    } catch (error) {
        const err = new Error("unable to retrive notification, plz try later");
        err.status = 501;
        err.extraDetails = "from getAllNotifications function inside user_controller";
        next(err);
    }
}

const getMyfriends = async (req, res, next) => {
    try {
        const { conversationId } = req.query;
        const chats = await Conversation.find({ members: req.clientAuthData._id, group_chat: false }).lean().populate("members", "user_name avatar_url")

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

module.exports = { getMyProfile, searchUser, sendFriendRequest, acceptFriendRequest, getAllNotifications, getMyfriends }