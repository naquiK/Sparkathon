const express = require('express');
require('dotenv').config();
const connectDB = require('./DB/connectionDB');
const userRoute = require('./routes/userRoute')

const app = express()



//middlewares
app.use(express.json());


//Routes
app.use('/api/v1', userRoute);

//db connection
connectDB();


//Port connection
const port = process.env.PORT || 5000;

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})