const mongoose = require("mongoose");
const URI = process.env.MONGODB_URI;

const connectDb = async () => {
    try {
        // console.log(URI);
        await mongoose.connect(URI);
        console.log("connection succesfull to db");
    } catch (error) {
        console.log("=======database connection failed========");
        console.log(error);
        process.exit(0);
    }
};

module.exports = connectDb;