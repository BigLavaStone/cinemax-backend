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
    date: { type: Date, required: true }, 
    time: { type: Date, required: true }  
}, { timestamps: true });

const Show = mongoose.model("Show", showSchema);

export default Show
