CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats >= 0)
);