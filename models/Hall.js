import mongoose  from "mongoose";

// Schema for an individual seat
const seatSchema = new mongoose.Schema({
    rowNo: { type: Number, required: true },
    colNo: { type: Number, required: true },
    rowLbl: { type: String, required: true },
    colLbl: { type: String, required: true }, // Kept as String in case of labels like '1A'
    lbl: { type: String, required: true },
    type: { type: String, default: 'seat' } // can be 'seat' or null
}, { _id: false });

// Schema for a row of seats
const rowSchema = new mongoose.Schema({
    rowNo: { type: Number, required: true },
    rowLbl: { type: String, required: true },
    seats: [seatSchema]
}, { _id: false });

// Main Hall schema
const hallSchema = new mongoose.Schema({
    hallName: { type: String, required: true },
    location: { type: String, required: true },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    totalSeat: { type: Number, required: true },
    seats: [rowSchema]
}, { timestamps: true });

const Hall = mongoose.model("Hall", hallSchema);

export default Hall