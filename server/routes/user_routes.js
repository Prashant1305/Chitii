const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth_middleware");
const { getUserForSidebar } = require("../controllers/user_controller");

router.get("/", verifyJwt, getUserForSidebar);

module.exports = router;