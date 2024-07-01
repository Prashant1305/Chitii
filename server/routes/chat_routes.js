const express = require("express");
const { upload } = require("../middleware/multer_middleware")

const router = express.Router();

const { sendMessage, getMessages, newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, getChatDetails, renameConversation, deleteChat } = require("../controllers/chat_controllers");
const verifyJwt = require("../middleware/auth_middleware");

router.post("/send/:id", verifyJwt, sendMessage);
router.get("/all-message/:id", verifyJwt, getMessages);
router.post("/newgroupchat", verifyJwt, newGroupChat);
router.get("/getmychats", verifyJwt, getMyChats);
router.get("/getgroupchats", verifyJwt, getMyGroups);
router.put("/addmembers", verifyJwt, addMembers);
router.delete("/removemember", verifyJwt, removeMembers);
router.delete("/leave/:id", verifyJwt, leaveGroup);
router.post("/sendmessage", verifyJwt, upload.array('attachments', 100), sendMessage);
router.post("/renamechat", verifyJwt, renameConversation);
router.delete("/deletechat", verifyJwt, deleteChat);

router.route("/:id").get(getChatDetails).put().delete(); // this should be atlast, else it would run every time by replacing id with route

module.exports = router;