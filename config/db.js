import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Determine if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

// Configure connection options
const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// Add SSL configuration for production (Render requires this)
if (isProduction) {
  connectionConfig.ssl = {
    rejectUnauthorized: false // Required for Render PostgreSQL
  };
}

// Create a new PostgreSQL connection pool
const pool = new Pool(connectionConfig);

// Test the database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Database connected successfully");
  }
});

// Initialize database tables
const initDb = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        message VARCHAR(255) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database tables initialized");
  } catch (error) {
    console.error("Error initializing database tables:", error);
  }
};

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // In production, you might want to implement reconnection logic here
  if (isProduction) {
    console.log('Attempting to reconnect to database...');
    // Simple reconnection attempt after 5 seconds
    setTimeout(() => {
      pool.connect();
    }, 5000);
  }
});

// Initialize the database
initDb();

export default pool;
