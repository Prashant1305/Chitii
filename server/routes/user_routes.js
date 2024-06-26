const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth_middleware");
const { getMyProfile, searchUser } = require("../controllers/user_controller");


router.post("/getmyprofile", verifyJwt, getMyProfile);
router.get("/search", verifyJwt, searchUser); // will search user by querying url


module.exports = router;