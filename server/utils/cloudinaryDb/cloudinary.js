const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // console.log("line from uploadcloudinary ======== ", process.env.CLOUDINARY_API_KEY);
        if (!localFilePath) {
            console.log("could not find filePath");
            return null;
        }
        // upload file on cloud
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("file has been uploaded successfully", response.url);
        fs.unlinkSync(localFilePath); //removing locally saved temporary file as the upload operation is succesfull

        return response;
    } catch (error) {
        console.log("yello")
        // fs.unlinkSync(localFilePath); //removing locally saved temporary file as the upload operation got failed
        const err = new Error("upload image failed");
        err.status = 500;
        err.extraDetails = "from uploadOnCloudinary function inside CloudinaryDb";
        next(err);
        return null;
    }
}

const deleteFromCloudinary = async (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id)
        // file has been deleted successfully
        return response;
    } catch (error) {
        const err = new Error("delete image failed");
        err.status = 500;
        err.extraDetails = "from deleteFromCloudinary function inside CloudinaryDb";
        next(err);
        return null;
    }
}

module.exports = { uploadOnCloudinary, deleteFromCloudinary };