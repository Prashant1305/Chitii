const express = require("express");
const verifyJwt = require("../middleware/auth_middleware");
const { login, logout, signup } = require("../controllers/auth_controllers");
const validate = require("../middleware/zodValidate-middleware");
const { userSchema, loginSchema } = require("../validator/user_validator");
const { upload } = require("../middleware/multer_middleware");

const router = express.Router();

router.post("/login", validate(loginSchema), login); // used zod validation

router.get("/logout", verifyJwt, logout);

router.post("/signup", upload.single('avatar'), validate(userSchema), signup); // used zod validation

module.exports = router