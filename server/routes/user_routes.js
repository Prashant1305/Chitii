const express = require("express");
const { verifyJwt } = require("../middleware/auth_middleware");
const { getMyProfile, searchUser, sendFriendRequest, acceptFriendRequest, getAllNotifications, getMyfriends } = require("../controllers/user_controller");
const { sendFriendRequestValidator, validateHandler, acceptFriendRequestValidator } = require("../middleware/express-validator_middleware");
const { route } = require("./chat_routes");

const router = express.Router();

router.get("/getmyprofile", verifyJwt, getMyProfile);
router.get("/search", verifyJwt, searchUser); // will search user by querying url
router.put("/sendfriendrequest", verifyJwt, sendFriendRequestValidator(), validateHandler, sendFriendRequest)
router.delete("/acceptfriendrequest", verifyJwt, acceptFriendRequestValidator(), validateHandler, acceptFriendRequest);
router.get("/getallnotification", verifyJwt, getAllNotifications);
router.get("/getmyfriends", verifyJwt, getMyfriends);

module.exports = router;