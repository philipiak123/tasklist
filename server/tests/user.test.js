const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('../app');

let testEmail = `testuser_${Date.now()}@example.com`;
const testPassword = 'Secret123!';
let token;
let userId;

describe('Auth flow integration', () => {
  let db;

  beforeAll(async () => {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',           
      password: '',           
      database: 'task',    
    });
  });

  test('Should register user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Successful register. Please confirm your account on email');
  });

  test('Should fail to register same user again', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is already in use");
  });

  test('Should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'WrongPass123' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Account not verified");
  });

  test('Should login but get 403 (account not verified)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not verified/i);
  });

  test('Manually verify user in database', async () => {
    const [result] = await db.execute('UPDATE users SET verified = 1 WHERE email = ?', [testEmail]);
    expect(result.affectedRows).toBe(1);
  });

  test('Should login successfully after verification', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('Should fetch user data with valid token', async () => {
    const res = await request(app)
      .get('/auth/data')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
    userId = res.body.id;
  });

  test('Should fail with invalid token', async () => {
    const res = await request(app)
      .get('/auth/data')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/invalid/i);
  });

    test('Should send forgot password email for existing user', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset link sent/i);
  });

  test('Should fail forgot password for non-existing user', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'notfound@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("No user with that email");
  });

  test('Should toggle dark mode with valid token', async () => {
    const res = await request(app)
      .patch('/auth/darkmode')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('Should fail dark mode toggle with invalid token', async () => {
    const res = await request(app)
      .patch('/auth/darkmode')
      .set('Authorization', 'Bearer bad.token.string');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('Should fail to change password with invalid token', async () => {
    const res = await request(app)
      .patch('/auth/change-password')
      .set('Authorization', 'Bearer invalid.token')
      .send({
        currentPassword: testPassword,
        newPassword: 'NewPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("jwt malformed");
  });

  test('Should fail to change password with wrong current password', async () => {
    const res = await request(app)
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Current password is incorrect.");
  });

  test('Should change password successfully with valid credentials', async () => {
    const res = await request(app)
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: testPassword,
        newPassword: 'NewPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password has been changed.");
  });

  test('Should login with new password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'NewPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

    test('Should logout successfully', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });

  test('Should fail to fetch data after logout', async () => {
    const res = await request(app)
      .get('/auth/data')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Token is blacklisted");
  });


});
