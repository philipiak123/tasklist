const db = require('../config/db');

describe('Database Insert and Query Test', () => {
  const testEmail = 'gg@gmail.com';
  const testName = 'Test User';

  beforeAll(async () => {
    // Wstaw dane do tabeli przed uruchomieniem testów
    const insertQuery = 'INSERT INTO users (email) VALUES (?)';
    await new Promise((resolve, reject) => {
      db.query(insertQuery, [testEmail], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  });

  

  it('should fetch object with email "gg@gmail.com"', async () => {
    const selectQuery = 'SELECT * FROM users WHERE email = ?';
    const results = await new Promise((resolve, reject) => {
      db.query(selectQuery, [testEmail], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    console.log('Results from database:', results);

    // Sprawdź, czy wynik jest poprawny
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].email).toBe(testEmail);
    expect(results[0].name).toBe(testName);
  });
});