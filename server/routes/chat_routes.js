const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup } = require("../controllers/chat_controllers");
const verifyJwt = require("../middleware/auth_middleware");

router.post("/send/:id", verifyJwt, sendMessage);
router.get("/all-message/:id", verifyJwt, getMessages);
router.post("/newgroupchat", verifyJwt, newGroupChat);
router.get("/getmychats", verifyJwt, getMyChats);
router.get("/getgroupchats", verifyJwt, getMyGroups);
router.put("/addmembers", verifyJwt, addMembers);
router.delete("/removemember", verifyJwt, removeMembers);
router.delete("/leave/:id", verifyJwt, leaveGroup);



module.exports = router;