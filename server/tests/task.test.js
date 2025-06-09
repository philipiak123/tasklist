const request = require('supertest');
const app = require('../app');

let token;
let createdListId;
let createdTaskId;

const testEmail = 'testuser_1747419888426@example.com';
const testPassword = 'Secret123!';

describe('Task API integration tests', () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    const listRes = await request(app)
      .post('/list/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Task Test List' });

    expect(listRes.status).toBe(201);

    const lists = await request(app)
      .get('/list/lists')
      .set('Authorization', `Bearer ${token}`);
      
    createdListId = lists.body.find(list => list.name === 'Task Test List')?.id;
    expect(createdListId).toBeDefined();
  });

  test('Should fail to add task without token', async () => {
    const res = await request(app)
      .post('/tasks/add')
      .send({ listId: createdListId, description: 'Task without token' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Should add task with valid token', async () => {
    const res = await request(app)
      .post('/tasks/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ listId: createdListId, description: 'Test task' });

    expect(res.status).toBe(201);
  });

  test('Should fetch tasks for list', async () => {
    const res = await request(app)
      .get(`/tasks/${createdListId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    createdTaskId = res.body[0].id;
    expect(createdTaskId).toBeDefined();
  });

  test('Should fail to update task without token', async () => {
    const res = await request(app)
      .put(`/tasks/edit/${createdTaskId}`)
      .send({ newDescription: 'New description without token' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Should update task description with token', async () => {
    const res = await request(app)
      .put(`/tasks/edit/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newDescription: 'Updated task description' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Successful change");
  });

  test('Should fail to delete task without token', async () => {
    const res = await request(app)
      .delete(`/tasks/delete/${createdTaskId}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('Should delete task with valid token', async () => {
    const res = await request(app)
      .delete(`/tasks/delete/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
