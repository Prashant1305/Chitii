const express = require("express");
const verifyJwt = require("../middleware/auth_middleware");
const { loginWithChitii, logout, signup, loginWithGoogleCode, loginWithTwitterCode, loginWithFaceBookCode } = require("../controllers/auth_controllers");
const validate = require("../middleware/zodValidate-middleware");
const { userSchema, loginSchema } = require("../validator/user_validator");
const { upload } = require("../middleware/multer_middleware");


const router = express.Router();

router.post("/login", validate(loginSchema), loginWithChitii); // used zod validation

router.get("/signupviagooglecode", loginWithGoogleCode);
router.get("/signupviatwittercode", loginWithTwitterCode);
router.get("/signupviafacebookcode", loginWithFaceBookCode)

router.get("/logout", logout);

router.post("/signup", upload.single('avatar'), validate(userSchema), signup); // used zod validation

module.exports = router