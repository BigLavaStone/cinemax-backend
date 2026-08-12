import Show from '../models/Show.js';
import Ticket from '../models/Ticket.js';

export const getShowStat = async (showId) => {
    const show = await Show.findById(showId).populate('hallId', 'totalSeat');
    if (!show) throw new Error("Show not found");

    const tickets = await Ticket.find({ showId });
    const bookedSeat = tickets.reduce((count, ticket) => count + ticket.bookedSeats.length, 0);

    return { totalSeat: show.hallId.totalSeat, bookedSeat };
};

export const isHallInUse = async (hallId) => {
    const show = await Show.findOne({ hallId });
    return !!show; // Returns true if a show exists, false otherwise
};

export const isShowSeatBookStarted = async (showId) => {
    const ticket = await Ticket.findOne({ showId });
    return !!ticket; // Returns true if at least one ticket exists
};