const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/message_controllers");
const verifyJwt = require("../middleware/auth_middleware");

router.post("/send/:id", verifyJwt, sendMessage);
router.get("/all-message/:id", verifyJwt, getMessages);

module.exports = router;