const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadImage = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        return {
            url: result.secure_url,
            publicId: result.public_id
        }
    } catch (err) {
        console.log("Error while uploading file to Cloudinary");
        throw new Error(err.message);
    }
    finally {
        // Clean up the local file after uploading
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    uploadImage
}

