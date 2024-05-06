const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth_middleware");
const { login, logout, signup, refreshAccessToken } = require("../controllers/auth_controllers");
const validate = require("../middleware/validate-middleware");
const { userSchema, loginSchema } = require("../validator/user_validator");

router.post("/login", validate(loginSchema), login);

router.get("/logout", verifyJwt, logout);

router.post("/signup", validate(userSchema), signup);
router.post("/refresh-access-token", verifyJwt, refreshAccessToken);

module.exports = router