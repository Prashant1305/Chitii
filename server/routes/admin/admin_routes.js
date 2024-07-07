const express = require("express");
const verifyJwt = require("../../middleware/auth_middleware");
const verifyAdmin = require("../../middleware/admin_middleware");
const { allUsers, allChats, allMessages, getDashboardStats } = require("../../controllers/admin/admin_controller");

const router = express.Router();
router.use(verifyJwt);
router.use(verifyAdmin);

router.get("/allusers", allUsers);
router.get("/allchats", allChats);
router.get("/allmessages", allMessages);
router.get("/dashboardstats", getDashboardStats);

module.exports = router