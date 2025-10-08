import pool from '../config/db.js';

export const reserveBooking = async (req, res) => {
  const { event_id, user_id } = req.body;

  if (!event_id || !user_id) {
    return res.status(400).json({ error: 'event_id and user_id are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock event row to prevent overbooking race conditions
    const eventRes = await client.query(
      'SELECT * FROM events WHERE id = $1 FOR UPDATE',
      [event_id]
    );

    if (eventRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalSeats = eventRes.rows[0].total_seats;

    // Check if user already booked
    const existing = await client.query(
      'SELECT id FROM bookings WHERE event_id = $1 AND user_id = $2',
      [event_id, user_id]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'User already booked for this event' });
    }

    // Check if seats available
    const bookedCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM bookings WHERE event_id = $1',
      [event_id]
    );

    if (bookedCount.rows[0].count >= totalSeats) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No seats available' });
    }

    // Insert booking
    const bookingRes = await client.query(
      'INSERT INTO bookings (event_id, user_id) VALUES ($1, $2) RETURNING *',
      [event_id, user_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Booking reserved successfully',
      booking: bookingRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User already booked for this event' });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};