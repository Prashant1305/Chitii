const { deleteFromCloudinary, uploadOnCloudinary } = require("../utils/cloudinaryDb/cloudinary");
const fs = require('fs');

const uploadImageToCloudinary = async (req, res, next) => {
    try {
        // console.log("======req.body=======", req.body);
        console.log("=======req.file======", req.file.path);
        console.log("upload started");
        const myurl = await uploadOnCloudinary(req.file.path);
        console.log(myurl);
        res.status(200).json({ msg: "file uploded succesfully", url: myurl.url, public_id: myurl.public_id })
    } catch (error) {
        const err = new Error("upload image failed");
        err.status = 500;
        err.extraDetails = "from uploadImageToCloudinary function inside feature_controllers";
        next(err);
    }
}
const deleteImageFromCloudinary = async (req, res, next) => {
    try {
        console.log("Delete started");
        const response = await deleteFromCloudinary(req.body.public_id);
        // console.log(response);
        if (response.result === 'ok') {
            res.status(200).json({ msg: "file deleted succesfully" });
        } else {
            res.status(500).json({ msg: "fail to delete file " });
        }
    } catch (error) {
        const err = new Error("delete image failed");
        err.status = 500;
        err.extraDetails = "from deleteImageFromCloudinary function inside feature_controllers";
        next(err);
    }
}

module.exports = { uploadImageToCloudinary, deleteImageFromCloudinary };