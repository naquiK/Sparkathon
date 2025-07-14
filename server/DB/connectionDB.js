const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://nknaqui72:FzdPhKosvnnW36AK@cluster0.bppdevl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.log(`Error connecting to the database: ${error.message}`)
    process.exit(1) // Exit the process with failure
  }
}

module.exports = connectDB
 