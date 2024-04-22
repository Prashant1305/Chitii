const Conversation = require("../models/conversation_model");

const getUserForSidebar = async (req, res, next) => {
    try {
        const loggedInUserId = req.clientAuthData._id;
        const recentConversationUserFullDetails = await Conversation.find({ participants: loggedInUserId }).select({ participants: 1 }).populate("participants");

        const requiredDetails = recentConversationUserFullDetails.map((conversation) => {
            let temp = [];
            if (conversation.participants.length > 0) {
                temp = conversation.participants.map((user) => {
                    return { _id: user._id, full_name: user.full_name, user_name: user.user_name, email: user.email, avatar_url: user.avatar_url, gender: user.gender }
                })
            }
            return temp;
        });
        res.status(200).json({ message: requiredDetails });

    } catch (error) {
        const err = new Error("unable to get sidebar");
        err.status = 400;
        err.extraDetails = "from getUserForSidebar function inside user_controller";
        next(err);
    }
}
module.exports = { getUserForSidebar };