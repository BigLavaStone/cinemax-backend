import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pwd: { type: String, required: true },
    sic: { type: String },
    branch: { type: String },
    year: { type: String }, 
    type: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User
