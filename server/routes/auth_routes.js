const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth_middleware");
const { login, logout, signup } = require("../controllers/auth_controllers");
const validate = require("../middleware/validate-middleware");
const { userSchema, loginSchema } = require("../validator/user_validator");
const { upload } = require("../middleware/multer_middleware");
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require("../controllers/feature_controllers");

router.post("/login", validate(loginSchema), login);

router.get("/logout", verifyJwt, logout);

router.post("/signup", validate(userSchema), signup);

router.post("/checkmiddle", verifyJwt)

router.post("/uploadImages", upload.single("avatar"), uploadImageToCloudinary);
router.post("/deleteImage", deleteImageFromCloudinary);



module.exports = router