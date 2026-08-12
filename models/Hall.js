import mongoose  from "mongoose";


const seatSchema = new mongoose.Schema({
    rowNo: { type: Number, required: true },
    colNo: { type: Number, required: true },
    rowLbl: { type: String, required: true },
    colLbl: { type: String, required: true }, 
    lbl: { type: String, required: true },
    type: { type: String, default: 'seat' } 
}, { _id: false });


const rowSchema = new mongoose.Schema({
    rowNo: { type: Number, required: true },
    rowLbl: { type: String, required: true },
    seats: [seatSchema]
}, { _id: false });


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
