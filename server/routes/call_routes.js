const express = require("express");
const { verifyJwt } = require("../middleware/auth_middleware");

const validate = require("../middleware/zodValidate-middleware");
const { userSchema, loginSchema } = require("../validator/user_validator");
const { upload } = require("../middleware/multer_middleware");
const { incomingCall } = require("../controllers/calling_controllers");

const router = express.Router();

router.post("/calling", verifyJwt, incomingCall);



module.exports = router