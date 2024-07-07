const { z } = require("zod");

const userSchema = z.object({
    full_name: z
        .string({ required_error: "fullname is required" })
        .trim()
        .min(3, { message: "fullname must be atleast of 3 char." })
        .max(255, { message: "fullname must not be more than 255 characters" }),

    user_name: z
        .string({ required_error: "username is required" })
        .trim()
        .min(3, { message: "username must be atleast of 3 char." })
        .max(255, { message: "username must not be more than 255 characters" }),

    mobile_number: z
        .string({ required_error: "mobile_number is required" })
        .min(3, { message: "mobile_number must be atleast of 6 characters" })
        .max(12, "mobile_number can't be greater than 12"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email address" })
        .min(3, { message: "Email must be atleast 3 characters" })
        .max(255, { message: "Email must not be more than 255 characters" }),

    password: z
        .string({ required_error: "password is required" })
        .trim()
        .min(6, { message: "password must be atleast of 6 char." })
        .max(100, { message: "password must not be more than 100 characters" }),

    gender: z
        .string({ required_error: "gender is required" })
        .trim()
        .min(3, { message: "gender must be atleast of 3 char." })
        .max(255, { message: "gender must not be more than 255 characters" }),
});

const loginSchema = z.object({
    emailOrUsername: z
        .string({ required_error: "Email is required" })
        .trim()
        .min(3, { message: "Email must be atleast 3 characters" })
        .max(255, { message: "Email must not be more than 255 characters" }),

    password: z
        .string({ required_error: "password is required" })
        .min(6, { message: "Password must be atleast of 6 characters" })
        .max(1024, "Password can't be greater than 1024"),
});

module.exports = { userSchema, loginSchema };