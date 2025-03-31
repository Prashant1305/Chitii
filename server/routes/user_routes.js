const express = require("express");
const { verifyJwt } = require("../middleware/auth_middleware");
const { getMyProfile, searchUser, sendFriendRequest, acceptFriendRequest, getAllNotifications, getMyfriends, getAllOnlineFriends, removeFriend, addFcmToken, removeFcmToken } = require("../controllers/user_controller");
const { sendFriendRequestValidator, validateHandler, acceptFriendRequestValidator } = require("../middleware/express-validator_middleware");

const router = express.Router();

router.get("/getmyprofile", verifyJwt, getMyProfile);
router.get("/search", verifyJwt, searchUser); // will search user by querying url
router.put("/sendfriendrequest", verifyJwt, sendFriendRequestValidator(), validateHandler, sendFriendRequest)
router.delete("/acceptfriendrequest", verifyJwt, acceptFriendRequestValidator(), validateHandler, acceptFriendRequest);
router.get("/getallnotification", verifyJwt, getAllNotifications);
router.get("/getmyfriends", verifyJwt, getMyfriends);
router.get("/onlinefriends", verifyJwt, getAllOnlineFriends);
router.delete("/unfriend", verifyJwt, removeFriend);
router.post("/fcm", verifyJwt, addFcmToken);
router.delete("/fcm", verifyJwt, removeFcmToken);

module.exports = router;