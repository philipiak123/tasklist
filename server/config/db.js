const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', // Zmienna środowiskowa lub domyślny host
  user: process.env.DB_USER || 'root', // Zmienna środowiskowa lub domyślny użytkownik
  password: process.env.DB_PASSWORD || '', // Zmienna środowiskowa lub domyślne hasło
  database: process.env.DB_NAME || 'tasklist', // Zmienna środowiskowa lub domyślna nazwa bazy
});

db.connect(err => {
  if (err) {
    console.error('Błąd połączenia z bazą danych:', err.stack);
    return;
  }
  
});

module.exports = db;
