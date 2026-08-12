import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Show from '../models/Show.js';
import Hall from '../models/Hall.js';
import Ticket from '../models/Ticket.js';
import { getShowStat, isHallInUse, isShowSeatBookStarted } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET;

// --- AUTH CONTROLLERS ---

export const signup = async (req, res) => {
    try {
        const { fname, lname, sic, branch, year, email, pwd } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPwd = await bcrypt.hash(pwd, 10);
        const user = await User.create({ fname, lname, sic, branch, year, email, pwd: hashedPwd });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Other error", details: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, pwd } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User doesn't exist" });

        const isMatch = await bcrypt.compare(pwd, user.pwd);
        if (!isMatch) return res.status(401).json({ error: "pwd doesn't match" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
        console.error("Login error:", error); // Log the error for debugging
    }
};

// --- USER CONTROLLERS ---

export const getProfile = async (req, res) => {
    try {
        const { fname, lname, sic, branch, year, email } = req.user;
        res.status(200).json({ fname, lname, sic, branch, year, email });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        // Extract only the allowed fields from the request body
        const { fname, lname, sic, branch, year } = req.body;
        
        // Find the user by the ID from the token and update their details
        // { new: true } ensures it returns the updated document, not the old one
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            { fname, lname, sic, branch, year },
            { new: true, runValidators: true }
        ).select('-pwd -type'); // Exclude password and type from the response for security

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                fname: updatedUser.fname,
                lname: updatedUser.lname,
                sic: updatedUser.sic,
                branch: updatedUser.branch,
                year: updatedUser.year,
                email: updatedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const getMainAttendeeDet = async (req, res) => {
    try {
        const { fname, lname, sic, branch, year } = req.user;
        res.status(200).json({ fname, lname, sic, branch, year });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

// --- SHOW CONTROLLERS ---

export const getShowList = async (req, res) => {
    try {
        const shows = await Show.find().populate('hallId', 'hallName');
        const current = [];
        const past = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ignore time for comparison as requested

        for (const show of shows) {
            const stats = await getShowStat(show._id);
            const showData = {
                showId: show._id,
                title: show.title,
                posterUrl: show.posterUrl,
                rating: show.rating,
                language: show.language,
                genere: show.genere, // Using your spelling
                date: show.date,
                time: show.time,
                hallName: show.hallId.hallName,
                totalSeat: stats.totalSeat,
                bookedSeat: stats.bookedSeat
            };

            if (new Date(show.date) >= today) {
                current.push(showData);
            } else {
                past.push(showData);
            }
        }
        res.status(200).json({ current, past });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const getShowDetail = async (req, res) => {
    try {
        const { showId } = req.params;
        const show = await Show.findById(showId).populate('hallId', 'hallName');
        if (!show) return res.status(404).json({ error: "Show not found" });

        let isUserBooked = null;
        if (req.user.type === 'user') {
            const ticket = await Ticket.findOne({ userId: req.user._id, showId });
            isUserBooked = !!ticket;
        }

        res.status(200).json({
            showId: show._id,
            title: show.title,
            posterUrl: show.posterUrl,
            trailerUrl: show.trailerUrl,
            ratings: show.rating,
            language: show.language,
            genere: show.genere,
            date: show.date,
            time: show.time,
            Synopsys: show.synopsys, // using your spelling
            hallId: show.hallId._id || show.hallId,
            hallName: show.hallId.hallName,
            isUserBooked
        });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const addShow = async (req, res) => {
    try {
        const showData = req.body;
        await Show.create(showData);
        res.status(201).json({ message: "conformation" });
    } catch (error) {
        res.status(500).json({ error: "Other error" && error.message });
    }
};

export const modifyShow = async (req, res) => {
    try {
        const { showId } = req.params;
        await Show.findByIdAndUpdate(showId, req.body);
        res.status(200).json({ message: "conformation" });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const deleteShow = async (req, res) => {
    try {
        const { showId } = req.params;
        const isStarted = await isShowSeatBookStarted(showId);
        if (isStarted) return res.status(400).json({ error: "Cannot delete, tickets are booked" });

        await Show.findByIdAndDelete(showId);
        res.status(200).json({ message: "conformation" });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

// --- HALL CONTROLLERS ---

export const getHallList = async (req, res) => {
    try {
        const halls = await Hall.find({}, 'hallName location totalSeat');
        res.status(200).json(halls.map(h => ({
            hallId: h._id, hallName: h.hallName, location: h.location, totalSeat: h.totalSeat
        })));
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const getHallDetail = async (req, res) => {
    try {
        const { hallId } = req.params;
        const hall = await Hall.findById(hallId);
        if (!hall) return res.status(404).json({ error: "Hall not found" });

        res.status(200).json({
            hallId: hall._id, hallName: hall.hallName, location: hall.location,
            rows: hall.rows, cols: hall.cols, seats: hall.seats, totalSeat: hall.totalSeat
        });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const addHall = async (req, res) => {
    try {
        await Hall.create(req.body);
        res.status(201).json({ message: "conformation" });
    } catch (error) {
        res.status(500).json({ error: "Other error" && error.message });
    }
};

export const modifyHall = async (req, res) => {
    try {
        const { hallId } = req.params;
        await Hall.findByIdAndUpdate(hallId, req.body);
        res.status(200).json({ message: "conformation" });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const delHall = async (req, res) => {
    try {
        const { hallId } = req.params;
        const inUse = await isHallInUse(hallId);
        if (inUse) return res.status(400).json({ error: "Hall is currently mapped to a show" });

        await Hall.findByIdAndDelete(hallId);
        res.status(200).json({ message: "conformation" });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

// --- TICKET & SEAT CONTROLLERS ---

export const getShowSeatMatrix = async (req, res) => {
    try {
        const { showId } = req.params;
        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ error: "Show not found" });

        const hall = await Hall.findById(show.hallId);
        
        // Get all booked seats across all tickets for this show
        const tickets = await Ticket.find({ showId });
        const bookedSeats = tickets.flatMap(ticket => ticket.bookedSeats);

        res.status(200).json({
            hallId: hall._id,
            hallName: hall.hallName,
            location: hall.location,
            rows: hall.rows,
            cols: hall.cols,
            seats: hall.seats,
            totalSeat: hall.totalSeat,
            bookedSeats
        });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

export const bookShow = async (req, res) => {
    try {
        const { showId, attendeeDetails, bookedSeats } = req.body;
        const ticket = await Ticket.create({
            userId: req.user._id,
            showId,
            attendeeDetails,
            bookedSeats
        });

        const show = await Show.findById(showId).populate('hallId');

        res.status(201).json({
            ticketId: ticket._id,
            title: show.title,
            posterUrl: show.posterUrl,
            rating: show.rating,
            language: show.language,
            genere: show.genere,
            date: show.date,
            time: show.time,
            hallName: show.hallId.hallName,
            bookedSeats: ticket.bookedSeats,
            attendeeDetails: ticket.attendeeDetails
        });
    } catch (error) {
        res.status(500).json({ error: "Other error" && error.message });
        console.error("Booking error:", error.message); // Log the error for debugging
    }
};

export const getTicketList = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tickets = await Ticket.find({ userId: req.user._id }).populate({
            path: 'showId',
            populate: { path: 'hallId', select: 'hallName' }
        });

        const formattedList = tickets
            .filter(t => new Date(t.showId.date) >= today) // Filter today + future
            .map(t => ({
                ticketId: t._id,
                title: t.showId.title,
                posterUrl: t.showId.posterUrl,
                date: t.showId.date,
                time: t.showId.time,
                hallName: t.showId.hallId.hallName,
                bookedSeats: t.bookedSeats,
                bookedSeatCount: t.bookedSeats.length
            }));

        res.status(200).json(formattedList);
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};

// export const getTicket = async (req, res) => {
//     try {
//         const { showId } = req.params;
//         const ticket = await Ticket.findOne({ userId: req.user._id, showId }).populate({
//             path: 'showId',
//             populate: { path: 'hallId', select: 'hallName' }
//         });

//         if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//         res.status(200).json({
//             ticketId: ticket._id,
//             title: ticket.showId.title,
//             posterUrl: ticket.showId.posterUrl,
//             rating: ticket.showId.rating,
//             language: ticket.showId.language,
//             genere: ticket.showId.genere,
//             date: ticket.showId.date,
//             time: ticket.showId.time,
//             hallName: ticket.showId.hallId.hallName,
//             bookedSeats: ticket.bookedSeats,
//             attendeeDetails: ticket.attendeeDetails
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Other error" });
//     }
// };

export const getTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await Ticket.findById(ticketId).populate({
            path: 'showId',
            populate: { path: 'hallId', select: 'hallName' }
        });

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        res.status(200).json({
            ticketId: ticket._id,
            title: ticket.showId.title,
            posterUrl: ticket.showId.posterUrl,
            rating: ticket.showId.rating,
            language: ticket.showId.language,
            genere: ticket.showId.genere,
            date: ticket.showId.date,
            time: ticket.showId.time,
            hallName: ticket.showId.hallId.hallName,
            bookedSeats: ticket.bookedSeats,
            attendeeDetails: ticket.attendeeDetails
        });
    } catch (error) {
        console.error("❌ Get Ticket Error:", error);
        res.status(500).json({ error: error.message || "Other error" });
    }
};

export const verifyTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await Ticket.findById(ticketId).populate({
            path: 'showId',
            populate: { path: 'hallId', select: 'hallName' }
        });

        if (!ticket) return res.status(404).json({ error: "Ticket does not exist" });

        res.status(200).json({
            ticketId: ticket._id,
            title: ticket.showId.title,
            posterUrl: ticket.showId.posterUrl,
            rating: ticket.showId.rating,
            language: ticket.showId.language,
            genere: ticket.showId.genere,
            date: ticket.showId.date,
            time: ticket.showId.time,
            hallName: ticket.showId.hallId.hallName,
            bookedSeats: ticket.bookedSeats,
            attendeeDetails: ticket.attendeeDetails
        });
    } catch (error) {
        res.status(500).json({ error: "Other error" });
    }
};