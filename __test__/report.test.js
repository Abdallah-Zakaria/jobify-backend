'use strict';
const supergoose = require('@code-fellows/supergoose');
const app = require('../src/server');
const mockRequest = supergoose(app.server);
const pg = require('../src/models/database');

xdescribe('Report', () => {
  beforeAll(async () => {
    await pg.connect();
  });

  afterAll(async () => {
    await pg.end();
  });

  let token;

  beforeEach(async () => {
    await mockRequest
      .post('/signin')
      .send({ email: 'demop@gmail.com', password: '123456' })
      .then((result) => {
        token = result.body.token;
      });
  });

  it('User can send report', () => {
    return mockRequest
      .post('/report')
      .send({ description: 'test' })
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(201);
      });
  });

  it(`User can't send an empty report`, () => {
    return mockRequest
      .post('/report')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(500);
      });
  });

  it(`User can get all reports`, () => {
    return mockRequest
      .get('/reports')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });
});
