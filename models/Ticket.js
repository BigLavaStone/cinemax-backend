import mongoose  from "mongoose";

// Sub-schema for attendee details
const attendeeSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    sic: { type: String },
    branch: { type: String },
    year: { type: String } // Changed to String
}, { _id: false });

// Sub-schema for booked seats
const bookedSeatSchema = new mongoose.Schema({
    rowNo: { type: Number, required: true },
    colNo: { type: Number, required: true },
    lbl: { type: String, required: true }
}, { _id: false });

// Main Ticket schema
const ticketSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    showId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    attendeeDetails: [attendeeSchema],
    bookedSeats: [bookedSeatSchema]
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket