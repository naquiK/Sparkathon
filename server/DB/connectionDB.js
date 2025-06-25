const mongoose = require('mongoose')

const connectDB = async () => {
   try {
     mongoose.connect(process.env.MONGODB_ULI
     )
    .then(() => {
        console.log('MongoDB connected successfully');
    })
   } catch (error) {
    console.log(`Error connecting to the database: ${error.message}`);
    process.exit(1); // Exit the process with failure
   }
}

module.exports = connectDB; 