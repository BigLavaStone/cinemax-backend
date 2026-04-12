import mongoose from "mongoose";

//function to connect to the  mongoDB database
export const connectDB = async() => {
    try{
        mongoose.connection.on('connected', () => {
            console.log("MongoDB connected successfully");
        });
         await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    }catch(err){
        console.log("Error connecting to MongoDB:", err);
        
    }
}