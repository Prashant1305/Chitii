const { body, param, validationResult } = require("express-validator");
const mongoose = require('mongoose');

const validateHandler = (req, res, next) => {
    const errors = validationResult(req); // returns array of object of errors

    const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(", ");

    if (errors.isEmpty()) {
        return next();
    }
    else {
        const error = {
            status: 400,
            message: "Fill the input properly",
            extraDetails: errorMessages
        };
        next(error);
    }

};

const renameGroupValidator = () => [
    body("conversationId", "Please Enter Chat ID").notEmpty(),
    body("conversationName", "Please Enter New Name").notEmpty(),
];

const addMemberValidator = () => [
    body("conversationId", "Please Enter Chat ID").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please Enter Members")
        .isArray({ min: 1, max: 97 })
        .withMessage("Members must be 1-97")
];

const newGroupChatValidator = () => [
    body("name", "please enter name of group").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please Enter Members")
        .isArray({ min: 2 })
        .withMessage("Members must be atleast 2")
];

const removeMembersValidator = () => [
    body("conversationId", "please provide chat id").notEmpty(),
    body("userId", "plz provide user Id").notEmpty()
        .isArray({ min: 0 })
        .withMessage("plz provide atleast one user id")
];

const leaveGroupValidator = () => [
    param("id", "please provide chat Id").notEmpty()
]

const sendFriendRequestValidator = () => [
    body("userId", "Please Enter User Id").notEmpty(),
];

const acceptFriendRequestValidator = () => [
    body("requestId", "Please Enter request Id").notEmpty(),
    body("accept", "plz accept request or decline it").notEmpty()
        .withMessage("plz accept request or decline it")
        .isBoolean()
        .withMessage("accept is Boolean type")
]

const validateMongoId = (paramName) => [
    param(paramName)
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid MongoDB ObjectId'),
];

module.exports = { validateHandler, renameGroupValidator, addMemberValidator, newGroupChatValidator, removeMembersValidator, leaveGroupValidator, sendFriendRequestValidator, acceptFriendRequestValidator, validateMongoId }