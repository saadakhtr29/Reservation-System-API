import express from 'express';
import { reserveBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/reserve', reserveBooking);

export default router;