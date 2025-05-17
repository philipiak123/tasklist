const request = require('supertest');
const app = require('../app'); // Express app

let token;
let createdListId;
const testEmail = 'testuser_1747419888426@example.com';
const testPassword = 'Secret123!';

describe('List API integration tests', () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  test('Should fail to add list without token', async () => {
    const res = await request(app)
      .post('/list/add')
      .send({ name: 'Lista bez tokenu' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Should successfully add list with token', async () => {
    const res = await request(app)
      .post('/list/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Moja testowa lista' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('List added successfully');
  });

  test('Should fetch user lists with token and store one ID', async () => {
    const res = await request(app)
      .get('/list/lists')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Pobierz ID pierwszej listy
    createdListId = res.body[0].id;
    expect(createdListId).toBeDefined();
  });

  test('Should fail to fetch user lists without token', async () => {
    const res = await request(app).get('/list/lists');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  // PATCH TESTS
  test('Should fail to update list name without token', async () => {
    const res = await request(app)
      .patch(`/list/${createdListId}`)
      .send({ newName: 'Nowa nazwa' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Should update list name with valid token and valid ID', async () => {
    const res = await request(app)
      .patch(`/list/${createdListId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newName: 'Zmieniona nazwa testowa' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  // DELETE TESTS
  test('Should fail to delete list without token', async () => {
    const res = await request(app)
      .delete(`/list/${createdListId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Should delete list with valid token and valid ID', async () => {
    const res = await request(app)
      .delete(`/list/${createdListId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });


});
