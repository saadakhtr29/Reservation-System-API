# Reservation-System-API

An API for booking events with built-in protection against race conditions and duplicate bookings. A single user cannot book twice for the same event.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Database Schema](#database-schema)
- [Transaction Management](#transaction-management)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Reservation System API is a Node.js/Express backend application that manages event bookings with robust safeguards against common issues in concurrent systems. It ensures data integrity through PostgreSQL transactions and prevents overbooking and duplicate user reservations.

## Features

- **Event Booking Management**: Create and manage event bookings through RESTful endpoints
- **Duplicate Prevention**: Automatically prevents users from booking the same event multiple times
- **Concurrency Control**: Uses database row-level locking to prevent race conditions and overbooking
- **Transaction Support**: All booking operations are wrapped in database transactions with automatic rollback on failure
- **Input Validation**: Validates all required fields before processing bookings
- **Error Handling**: Comprehensive error handling with meaningful HTTP status codes
- **Comprehensive Testing**: Jest test suite with 100% endpoint coverage

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.1.0)
- **Database**: PostgreSQL (v12+)
- **Testing**: Jest (v30.2.0) with Supertest (v7.1.4)
- **Language**: JavaScript (ES6+)
- **Transpiler**: Babel (v7.28.4)
- **Environment Management**: dotenv (v17.2.3)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm (v9 or higher)
- Git

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**

```bash
git clone <repository-url>
cd Reservation-System-API
```

2. **Install dependencies**

```bash
npm install
```

This will install all required dependencies specified in `package.json`:
- Express.js for the web framework
- PostgreSQL driver for database connectivity
- Jest and Babel for testing and transpilation
- Other development dependencies

## Configuration

The application uses environment variables for configuration. Two environment files are supported:

### Development Environment (.env)

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/reservation_db
PORT=3000
NODE_ENV=development
```

### Test Environment (.env.test)

Create a `.env.test` file in the project root for testing:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/reservation_test_db
PORT=3001
NODE_ENV=test
```

### Environment Variables Explained

- **DATABASE_URL**: Connection string to your PostgreSQL database in the format: `postgresql://username:password@host:port/database_name`
- **PORT**: Port number on which the server will listen (default: 3000)
- **NODE_ENV**: Environment flag for distinguishing between development and test environments

**Important**: The `.gitignore` file is configured to exclude both `.env` and `.env.test` files from version control to protect sensitive credentials.

## Database Setup

### Prerequisites for Database

Ensure PostgreSQL is running and accessible. If you don't have PostgreSQL installed, download it from [postgresql.org](https://www.postgresql.org/download/).

### Creating the Database

1. **Connect to PostgreSQL**

```bash
psql -U postgres
```

2. **Create the development database**

```sql
CREATE DATABASE reservation_db;
```

3. **Create the test database**

```sql
CREATE DATABASE reservation_test_db;
```

4. **Exit PostgreSQL**

```sql
\q
```

### Running Database Migrations

The database schema is defined in SQL files located in the `models/` directory. You need to run these scripts to set up the tables.

**For Development:**

```bash
psql -U postgres -d reservation_db -f models/events.sql
psql -U postgres -d reservation_db -f models/bookings.sql
```

**For Testing:**

```bash
psql -U postgres -d reservation_test_db -f models/events.sql
psql -U postgres -d reservation_test_db -f models/bookings.sql
```

Alternatively, if your application has setup scripts, they may handle this automatically.

## Running the Application

### Development Mode

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

You should see output similar to:
```
Server running on port 3000
```

### Testing the Server

Once the server is running, verify it's working:

```bash
curl http://localhost:3000/
```

Expected response:
```
Event Booking API is running
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Create a Booking

**Endpoint**: `POST /bookings/reserve`

**Description**: Creates a new booking for a user at an event. Prevents duplicate bookings and overbooking.

**Request Body**:
```json
{
  "event_id": 1,
  "user_id": "user123"
}
```

**Parameters**:
- `event_id` (integer, required): The unique identifier of the event
- `user_id` (string, required): The unique identifier of the user making the reservation

**Success Response** (201 Created):
```json
{
  "message": "Booking reserved successfully",
  "booking": {
    "id": 1,
    "event_id": 1,
    "user_id": "user123",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

- **400 Bad Request**: Missing required fields
```json
{
  "error": "event_id and user_id are required"
}
```

- **404 Not Found**: Event does not exist
```json
{
  "error": "Event not found"
}
```

- **409 Conflict**: User already booked for this event
```json
{
  "error": "User already booked for this event"
}
```

- **409 Conflict**: No seats available
```json
{
  "error": "No seats available"
}
```

- **500 Internal Server Error**: Server-side error
```json
{
  "error": "Internal server error"
}
```

**Example Usage**:

```bash
curl -X POST http://localhost:3000/api/bookings/reserve \
  -H "Content-Type: application/json" \
  -d '{"event_id": 1, "user_id": "user123"}'
```

## Testing

The project includes a comprehensive test suite covering all endpoints and edge cases.

### Running Tests

```bash
npm test
```

This command runs Jest in band mode with the test environment configuration. Output will show all test results with pass/fail status.

### Test Suite Overview

The test suite (`tests/booking.test.mjs`) includes five test cases:

1. **Successful Booking Creation**: Verifies that a valid booking is created successfully with status 201
2. **Duplicate Booking Prevention**: Ensures the same user cannot book the same event twice (status 409)
3. **Overbooking Prevention**: Confirms bookings are rejected when all seats are full (status 409)
4. **Non-existent Event Handling**: Validates proper error handling for non-existent events (status 404)
5. **Invalid Request Handling**: Tests validation of missing required fields (status 400)

### Test Database Setup

Before running tests, ensure you've created the test database and tables as described in the [Database Setup](#database-setup) section.

The test suite automatically:
- Clears all data before and after each test
- Creates a fresh test event with 2 seats for each test
- Closes the database connection after all tests complete

## Project Structure

```
Reservation-System-API/
├── config/
│   └── db.js                      # Database connection configuration
├── controllers/
│   └── bookingController.js       # Booking business logic
├── models/
│   ├── events.sql                 # Events table schema
│   └── bookings.sql               # Bookings table schema
├── routes/
│   └── bookingRoutes.js           # API route definitions
├── tests/
│   └── booking.test.mjs           # Test suite for booking endpoints
├── server.js                      # Express application entry point
├── package.json                   # Project dependencies and scripts
├── babel.config.cjs               # Babel transpiler configuration
├── jest.setup.cjs                 # Jest test setup and environment config
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

### File Descriptions

**config/db.js**: Establishes PostgreSQL connection using the pg library with connection pooling for better performance and resource management.

**controllers/bookingController.js**: Contains the `reserveBooking` function which handles all business logic for creating bookings, including transaction management, concurrency control, and validation.

**models/**: SQL schema definitions for database tables with appropriate constraints and relationships.

**routes/bookingRoutes.js**: Defines all API routes and maps them to their corresponding controller functions.

**server.js**: Entry point of the application. Initializes Express, configures middleware, and starts the server.

**tests/booking.test.mjs**: Comprehensive test suite using Jest and Supertest for integration testing.

## Error Handling

The application implements comprehensive error handling:

### Input Validation

All requests are validated for required fields before processing. Missing fields return a 400 Bad Request status.

### Concurrency Management

The booking controller uses PostgreSQL transactions with row-level locking (`FOR UPDATE`) to prevent race conditions. This ensures that even with concurrent requests, the system maintains data integrity.

### Database Constraints

- The `bookings` table has a `UNIQUE(event_id, user_id)` constraint that prevents duplicate bookings at the database level
- The `events` table has a `CHECK (total_seats >= 0)` constraint ensuring non-negative seat counts
- Foreign key constraints ensure referential integrity between tables

### Error Logging

Errors are logged to the console for debugging purposes. In production, consider integrating a proper logging service.

### Transaction Rollback

All database transactions automatically roll back on error, preventing partial or inconsistent state changes.

## Database Schema

### Events Table

```sql
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats >= 0)
);
```

**Columns**:
- `id`: Primary key, auto-incrementing integer
- `name`: Event name (required, text)
- `total_seats`: Maximum number of available seats (required, must be >= 0)

### Bookings Table

```sql
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);
```

**Columns**:
- `id`: Primary key, auto-incrementing integer
- `event_id`: Foreign key referencing events (deleted when event is deleted)
- `user_id`: Unique identifier for the user (text)
- `created_at`: Timestamp of booking creation (defaults to current time)

**Constraints**:
- `UNIQUE(event_id, user_id)`: Ensures each user can only book once per event
- Foreign key with `ON DELETE CASCADE`: Automatically removes bookings when an event is deleted

## Transaction Management

The booking system uses database transactions to maintain consistency:

1. **Transaction Start**: `BEGIN` - Starts a new transaction
2. **Row Locking**: `FOR UPDATE` - Locks the event row to prevent concurrent modifications
3. **Validation**: Checks for duplicate bookings and available seats
4. **Insertion**: Adds the booking record
5. **Commit or Rollback**: Either commits all changes or rolls back on error

This approach ensures that booking operations are atomic, consistent, isolated, and durable (ACID properties).

## Contributing

We welcome contributions to improve the Reservation System API. Please follow these guidelines:

### Before Starting

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature: `git checkout -b feature/your-feature-name`

### Development Workflow

1. Make your changes
2. Run tests to ensure everything works: `npm test`
3. Follow the existing code style and conventions
4. Add tests for any new functionality
5. Commit with clear, descriptive messages: `git commit -m "Add feature: description"`

### Submitting Changes

1. Push your branch to your fork
2. Create a Pull Request to the main repository
3. Provide a clear description of your changes
4. Link any related issues

### Code Standards

- Use consistent indentation (2 spaces)
- Follow ES6+ best practices
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and modular

### Testing Requirements

- All new features must include tests
- Existing tests must continue to pass
- Aim for high code coverage

## License

This project is licensed under the ISC License. See the LICENSE file for details.

---

**Last Updated**: January 2025

For questions or support, please open an issue in the repository.
