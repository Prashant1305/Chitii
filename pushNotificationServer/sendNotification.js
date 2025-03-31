const admin = require("firebase-admin");
const serviceAccount = require("./chitii-7acd3-firebase-adminsdk-fbsvc-9b3057d029.json");
const Fcm = require("./model/fcm_model");

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async ({ data }) => {
    const payload = {
        token: undefined,
        data: {
            title: data?.message?.title || "no Title passed",
            body: data?.message?.text || "no Body passed",
            url: data?.message?.url || "NO url passed"
        }
    };

    try {
        const { members } = data
        //fetch tokens from members stroed in db
        const fcms = await Fcm.find({ user: { $in: members } }).select("tokens").lean()
        const tokens = fcms.map((fcm) => fcm.tokens).flat(); // Flatten the array of tokens
        if (tokens.length === 0) {
            console.log("No tokens found for the provided members.");
            return;
        }

        await Promise.allSettled(
            tokens.map(async (token) => {
                try {
                    await admin.messaging().send({ ...payload, token });
                } catch (error) {
                    if (
                        error.code === "messaging/invalid-registration-token" ||
                        error.code === "messaging/registration-token-not-registered"
                    ) {
                        await removeExpiredToken(token); // Properly removes expired token
                    }
                }
            })
        );

    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

const removeExpiredToken = async (token) => {
    try {
        // Find the document that contains the token
        const fcmDocument = await Fcm.findOne({ tokens: token });

        if (!fcmDocument) {
            console.log("Token not found in any document.");
            return;
        }

        // Remove the token from the array
        await Fcm.updateOne(
            { _id: fcmDocument._id },
            { $pull: { tokens: token } } // Correct method to remove from array
        );

        console.log("Expired token removed successfully:", token);
    } catch (error) {
        console.error("Error removing expired tokens:", error);
    }
};


module.exports = { sendNotification }