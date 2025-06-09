const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', 
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'tasklist', 
});

db.connect(err => {
  if (err) {
    console.error('Db error:', err.stack);
    return;
  }
  
});

module.exports = db;
