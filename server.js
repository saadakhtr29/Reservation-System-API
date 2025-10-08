import express from 'express';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Event Booking API is running ');
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));