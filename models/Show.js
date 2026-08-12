import mongoose  from "mongoose";

const showSchema = new mongoose.Schema({
    hallId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hall', 
        required: true 
    },
    title: { type: String, required: true },
    posterUrl: { type: String },
    trailerUrl: { type: String },
    rating: { type: Number },
    language: { type: String },
    genere: { type: String },
    synopsys: { type: String },
    date: { type: Date, required: true }, // Stores the date of the show
    time: { type: Date, required: true }  // Changed to Date for easy JS Date object manipulation
}, { timestamps: true });

const Show = mongoose.model("Show", showSchema);

export default Show