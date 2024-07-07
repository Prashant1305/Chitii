const express = require("express");
const { upload } = require("../middleware/multer_middleware");
const { renameGroupValidator, validateHandler, addMemberValidator, newGroupChatValidator, removeMembersValidator, leaveGroupValidator } = require("../middleware/express-validator_middleware")

const { sendMessage, getMessages, newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, getChatDetails, renameConversation, deleteChat } = require("../controllers/chat_controllers");
const verifyJwt = require("../middleware/auth_middleware");

const router = express.Router();

// router.post("/send/:id", verifyJwt, sendMessage);
// router.get("/all-message/:id", verifyJwt, getMessages);
router.post("/newgroupchat", verifyJwt, newGroupChatValidator(), validateHandler, newGroupChat);
router.get("/getmychats", verifyJwt, getMyChats);
router.get("/getgroupchats", verifyJwt, getMyGroups);
router.put("/addmembers", verifyJwt, addMemberValidator(), validateHandler, addMembers);
router.delete("/removemember", verifyJwt, removeMembersValidator(), validateHandler, removeMembers);
router.delete("/leave/:id", verifyJwt, leaveGroupValidator(), validateHandler, leaveGroup);
router.post("/sendmessage", verifyJwt, upload.array('attachments', 100), sendMessage);
router.post("/renamechat", verifyJwt, renameGroupValidator(), validateHandler, renameConversation);
router.delete("/deletechat", verifyJwt, deleteChat);
router.get("/getmessages/:id", verifyJwt, getMessages);


router.route("/:id").get(verifyJwt, getChatDetails).put().delete(); // this should be atlast, else it would run every time by replacing id with route

module.exports = router;