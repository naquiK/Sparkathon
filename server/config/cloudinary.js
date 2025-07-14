const cloudinary = require("cloudinary").v2
const fs = require("fs")

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "eKart",
    })

    // Delete the local file after upload
    fs.unlinkSync(filePath)

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    // Delete the local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    throw error
  }
}

module.exports = { uploadImage, cloudinary }
