import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    signup, login,
    getProfile, updateProfile, getMainAttendeeDet,
    getShowList, getShowDetail, addShow, modifyShow, deleteShow,
    getHallList, getHallDetail, addHall, modifyHall, delHall,
    getShowSeatMatrix, bookShow, getTicketList, getTicket, verifyTicket
} from '../controllers/index.js';

const router = express.Router();

// AUTHENTICATION ROUTES
router.post('/signup', signup);
router.post('/login', login);

// ALL ROUTES BELOW REQUIRE AUTHENTICATION
router.use(verifyToken); 

// USER ROUTES
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/attendee-details', getMainAttendeeDet);

// SHOW ROUTES 
router.get('/shows', getShowList);
router.post('/shows', addShow);
router.get('/shows/:showId', getShowDetail);
router.put('/shows/:showId', modifyShow);
router.delete('/shows/:showId', deleteShow);

// HALL ROUTES 
router.get('/halls', getHallList);
router.post('/halls', addHall);
router.get('/halls/:hallId', getHallDetail);
router.put('/halls/:hallId', modifyHall);
router.delete('/halls/:hallId', delHall);

// TICKET & SEAT ROUTES 
router.get('/shows/:showId/seats', getShowSeatMatrix);
router.post('/tickets/book', bookShow);
router.get('/tickets', getTicketList);
router.get('/tickets/show/:showId', getTicket);
router.get('/tickets/:ticketId', getTicket);
router.get('/tickets/:ticketId/verify', verifyTicket);

export default router;
