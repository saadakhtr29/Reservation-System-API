import request from 'supertest';
import express from 'express';
import bookingRoutes from '../routes/bookingRoutes.js';
import pool from '../config/db.js';

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

beforeAll(async () => {
  await pool.query('DELETE FROM bookings;');
  await pool.query('DELETE FROM events;');
});

afterAll(async () => {
  await pool.end();
});

describe('Booking API', () => {
  let eventId;

  beforeEach(async () => {
    await pool.query('DELETE FROM bookings;');
    await pool.query('DELETE FROM events;');

    const eventRes = await pool.query(
      'INSERT INTO events (name, total_seats) VALUES ($1, $2) RETURNING id',
      ['Test Event', 2]
    );
    eventId = eventRes.rows[0].id;
  });

  test('should create a booking successfully', async () => {
    const res = await request(app)
      .post('/api/bookings/reserve')
      .send({ event_id: eventId, user_id: 'user1' });

    expect(res.statusCode).toBe(201);
    expect(res.body.booking).toHaveProperty('id');
    expect(res.body.booking.user_id).toBe('user1');
  });

  test('should prevent duplicate booking by the same user', async () => {
    // first booking
    await request(app)
      .post('/api/bookings/reserve')
      .send({ event_id: eventId, user_id: 'user1' });

    // duplicate booking
    const res = await request(app)
      .post('/api/bookings/reserve')
      .send({ event_id: eventId, user_id: 'user1' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('User already booked for this event');
  });

  test('should prevent booking if seats are full', async () => {
    await request(app).post('/api/bookings/reserve').send({ event_id: eventId, user_id: 'user1' });
    await request(app).post('/api/bookings/reserve').send({ event_id: eventId, user_id: 'user2' });

    const res = await request(app)
      .post('/api/bookings/reserve')
      .send({ event_id: eventId, user_id: 'user3' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('No seats available');
  });

  test('should return 404 if event does not exist', async () => {
    const res = await request(app)
      .post('/api/bookings/reserve')
      .send({ event_id: 9999, user_id: 'user1' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });

  test('should return 400 if request is invalid', async () => {
    const res = await request(app).post('/api/bookings/reserve').send({ event_id: eventId });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('event_id and user_id are required');
  });
});
