'use strict';

const supergoose = require('@code-fellows/supergoose');
const app = require('../src/server');
const mockRequest = supergoose(app.server);
const pg = require('../src/models/database');

describe('Admin', () => {
  let token;
  beforeAll(async () => {
    pg.connect();
    pg.query(`DROP TABLE IF EXISTS auth, person, company, applications, jobs, job_offers, admin_reports, notifications, applications_api, saved_jobs, messages; CREATE TABLE IF NOT EXISTS auth( id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE, password VARCHAR(255), account_type VARCHAR(255), account_status VARCHAR(255) DEFAULT 'pending', verify_token VARCHAR(255)); CREATE TABLE IF NOT EXISTS person ( id SERIAL PRIMARY KEY, first_name VARCHAR(255), last_name VARCHAR(255), phone VARCHAR(255), job_title VARCHAR(255), country VARCHAR(255), age INT DEFAULT 23, avatar VARCHAR(255) DEFAULT 'https://library.kissclipart.com/20180929/ooq/kissclipart-avatar-person-clipart-avatar-computer-icons-person-87355c56a1748473.jpg', experince VARCHAR(255) DEFAULT '0', cv VARCHAR(255) DEFAULT 'Edit your profile', auth_id INT REFERENCES auth (id) ); CREATE TABLE IF NOT EXISTS company ( id SERIAL PRIMARY KEY, company_name VARCHAR(255), phone VARCHAR(255), company_url VARCHAR(255), logo VARCHAR(255) DEFAULT 'https://www.flaticon.com/svg/static/icons/svg/993/993891.svg', country VARCHAR(255), auth_id INT REFERENCES auth (id) ); CREATE TABLE IF NOT EXISTS jobs ( id SERIAL PRIMARY KEY, title VARCHAR(255), location VARCHAR(255), type VARCHAR(255), description TEXT, applicants_num INT DEFAULT 0, company_id INT REFERENCES company (id) ); CREATE TABLE IF NOT EXISTS applications_api ( id SERIAL PRIMARY KEY, title VARCHAR(255), location VARCHAR(255), type VARCHAR(255), company_name VARCHAR(255), logo VARCHAR(255), status VARCHAR(255) DEFAULT 'Submitted', person_id INT REFERENCES person (id) ); CREATE TABLE IF NOT EXISTS applications ( id SERIAL PRIMARY KEY, status VARCHAR(255) DEFAULT 'Pending', person_id INT REFERENCES person (id), job_id INT REFERENCES jobs (id), company_id INT REFERENCES company (id) ); CREATE TABLE IF NOT EXISTS saved_jobs ( id SERIAL PRIMARY KEY, title VARCHAR(255), location VARCHAR(255), type VARCHAR(255), description TEXT, company_name VARCHAR(255), phone VARCHAR(255), company_url VARCHAR(255), logo VARCHAR(255) DEFAULT 'https://www.flaticon.com/svg/static/icons/svg/993/993891.svg', country VARCHAR(255), job_id INT REFERENCES jobs (id) UNIQUE, person_id INT REFERENCES person (id) ); CREATE TABLE IF NOT EXISTS job_offers ( id SERIAL PRIMARY KEY, title VARCHAR(255), location VARCHAR(255), type VARCHAR(255), description TEXT, status VARCHAR(255) DEFAULT 'Pending', person_id INT REFERENCES person (id), company_id INT REFERENCES company (id) ); CREATE TABLE IF NOT EXISTS admin_reports ( id SERIAL PRIMARY KEY, description TEXT, response TEXT, auth_id INT REFERENCES auth (id) ); CREATE TABLE IF NOT EXISTS notifications ( id SERIAL PRIMARY KEY, title VARCHAR(255), description TEXT, seen VARCHAR(255), auth_id INT REFERENCES auth (id) ); CREATE TABLE IF NOT EXISTS messages ( id SERIAL PRIMARY KEY, body TEXT NOT NULL, person_id INT REFERENCES person (id), company_id INT REFERENCES company (id) ); INSERT INTO auth (email,password,account_type,account_status) VALUES('demop@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','p','active'); INSERT INTO auth (email,password,account_type,account_status) VALUES('democ@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','c','active'); INSERT INTO auth (email,password,account_type,account_status) VALUES('demop2@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','p','pending'); INSERT INTO auth (email,password,account_type,account_status) VALUES('democ2@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','c','active'); INSERT INTO auth (email,password,account_type,account_status) VALUES('demop3@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','p','blocked'); INSERT INTO auth (email,password,account_type,account_status) VALUES('democ3@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','c','active'); INSERT INTO auth (email,password,account_type,account_status) VALUES('demoadmin@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','admin','active');INSERT INTO auth (email,password,account_type,account_status) VALUES('demoeditor@gmail.com','$2b$05$mmpitpTUVYrZfKYjauH0/efhMGB0UtsbkFBvXPvcs6IQhFSeYSC2K','editor','active');INSERT INTO person (first_name, last_name, phone, job_title, country, age, avatar, experince, cv, auth_id) VALUES ('Malek','Ahmed','0790278534','Developer','USA',24,'https://library.kissclipart.com/20180929/ooq/kissclipart-avatar-person-clipart-avatar-computer-icons-person-87355c56a1748473.jpg','5','https://www.docdroid.net/izBd6Li/cv-pdf', 1); INSERT INTO person (first_name, last_name, phone, job_title, country, age, avatar, experince, cv, auth_id) VALUES ('Malek','Ahmed','0790278534','civil eng','Jordan',26,'https://library.kissclipart.com/20180929/ooq/kissclipart-avatar-person-clipart-avatar-computer-icons-person-87355c56a1748473.jpg','5','https://www.docdroid.net/izBd6Li/cv-pdf', 3); INSERT INTO person (first_name, last_name, phone, job_title, country, age, avatar, experince, cv, auth_id) VALUES ('Malek','Ahmed','0790278534','civil eng','Jordan',26,'https://library.kissclipart.com/20180929/ooq/kissclipart-avatar-person-clipart-avatar-computer-icons-person-87355c56a1748473.jpg','5','https://www.docdroid.net/izBd6Li/cv-pdf', 5); INSERT INTO company (company_name,phone,company_url,logo,country,auth_id) VALUES ('Demo Company', '079028555', 'www.demo.com', 'https://www.flaticon.com/svg/static/icons/svg/993/993891.svg', 'USA', 2); INSERT INTO company (company_name,phone,company_url,logo,country,auth_id) VALUES ('Demo Company', '079028555', 'www.demo.com', 'https://www.flaticon.com/svg/static/icons/svg/993/993891.svg', 'KSA', 4); INSERT INTO company (company_name,phone,company_url,logo,country,auth_id) VALUES ('Demo Company', '079028555', 'www.demo.com', 'https://www.flaticon.com/svg/static/icons/svg/993/993891.svg', 'KSA', 6); INSERT INTO jobs (title,location,type,description,company_id) VALUES ('Developer','Jordan','Full Time','A full time job with 900jd salary.',1); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('Developer','usa','Full Time (iam from database)','A full time job with 900jd salary.',3,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('civil eng','Jordan','Full Time (iam from database)','A full time job with 100jd salary 24hour wooork.',2,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('civil eng','ksa','Full Time (iam from database)','A full time job with 900jd salary 24hour wooork.',2,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('civil eng','uae','Full Time (iam from database)','A full time job with 1000jd salary 24hour wooork.',2,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('mechanical eng','uae','Full Time (iam from database)','A full time job with 1000jd salary 24hour wooork.',1,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('Developer','Jordan','Full Time','A full time job with 900jd salary.',2,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('Developer','usa','Full Time (iam from database)','A full time job with 900jd salary.',1,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('accounting','Jordan','Full Time (iam from database)','A full time job with 100jd salary 24hour wooork.',3,50); INSERT INTO jobs (title,location,type,description,company_id, applicants_num) VALUES ('accounting','ksa','Full Time (iam from database)','A full time job with 900jd salary 24hour wooork.',1,50); INSERT INTO applications (status,person_id,job_id,company_id) VALUES ('Pending', 1,1,3); INSERT INTO applications (status,person_id,job_id,company_id) VALUES ('Pending', 1,2,1); INSERT INTO applications (status,person_id,job_id,company_id) VALUES ('Pending', 1,3,2); INSERT INTO applications (status,person_id,job_id,company_id) VALUES ('Pending', 1,4,3); INSERT INTO applications (status,person_id,job_id,company_id) VALUES ('Pending', 1,5,1); INSERT INTO applications_api (title,location,type,company_name,person_id) VALUES ('developer','jordan','full time','zeko co',1); INSERT INTO job_offers (title,location,type,description,status,person_id,company_id) VALUES ('Web Dev','Jordan','Full Time','500 salary','Pending',1,2); INSERT INTO job_offers (title,location,type,description,status,person_id,company_id) VALUES ('Web Dev','Jordan','Full Time','500 salary','Accepted',1,1); INSERT INTO job_offers (title,location,type,description,status,person_id,company_id) VALUES ('backEnd Dev','Jordan','Full Time','500 salary','Accepted',1,3); INSERT INTO job_offers (title,location,type,description,status,person_id,company_id) VALUES ('frontEnd Dev','Jordan','Full Time','500 salary','Rejected',1,2); INSERT INTO job_offers (title,location,type,description,status,person_id,company_id) VALUES ('frontEnd Dev','Jordan','Full Time','500 salary','Rejected',1,1);INSERT INTO notifications (title,description,seen,auth_id) VALUES ('Offer','You got an offer from company name','false',1); INSERT INTO admin_reports (description,response,auth_id) VALUES ('i am report from person',null,1); INSERT INTO admin_reports (description,response,auth_id) VALUES ('i am report from company num1',null,2); INSERT INTO admin_reports (description,response,auth_id) VALUES ('i am report from company num2',null,2); INSERT INTO notifications (title,description,seen,auth_id) VALUES ('Offer','You got an offer from company name','false',1); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 1 to person 2',2,1); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 2 to person 2',2,2); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 3 to person 2',2,3); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 1 to person 1',1,1); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 2 to person 1',1,2); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 3 to person 1',1,3); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 1 to person 2',2,1); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 2 to person 2',2,2); INSERT INTO messages (body,person_id,company_id) VALUES ('this is message from company 3 to person 2',2,3); `);
  });

  beforeEach(async () => {
    await mockRequest
      .post('/signin')
      .send({ email: 'demoadmin@gmail.com', password: '123456' })
      .then((result) => {
        token = result.body.token;
      });
  });

  afterAll(async () => {
    pg.end();
  });

  it('Admins can access dashboard successfully', () => {
    return mockRequest
      .get('/admin')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });
  it('Normal users and companies cannot access admins routes', async () => {
    await mockRequest.post('/logout');
    await mockRequest
      .post('/signin')
      .send({ email: 'demop@gmail.com', password: '123456' })
      .then((result) => {
        token = result.body.token;
      });
    return mockRequest.get('/search/employee').then((result) => {
      expect(result.status).toBe(500);
      expect(result.text).toBe('{"error":"Access denied"}');
    });
  });
  it('Admins only can block users and companies', async () => {
    return await mockRequest
      .patch('/admin/block/10')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(201);
      });
  });
  it('Admins only can unblock users and companies', async () => {
    return await mockRequest
      .patch('/admin/removeBlock/10')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(201);
      });
  });
  it('Editors cannot block users or companies', async () => {
    await mockRequest.post('/logout');
    await mockRequest
      .post('/signin')
      .send({ email: 'demoeditor@gmail.com', password: '123456' })
      .then((result) => {
        token = result.body.token;
      });
    return await mockRequest
      .patch('/admin/block/3')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(500);
        expect(result.text).toBe('{"error":"Access Denied, You are not Authorized"}');
      });
  });
  it('Admins can see all reports from users and companies', async () => {
    return await mockRequest
      .get('/admin/report')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });
  it('Admins can see certain report from users and companies', async () => {
    return await mockRequest
      .get('/admin/report/2')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });

  it('Admins can delete certain report', async () => {
    return await mockRequest
      .delete('/admin/report/1')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(202);
      });
  });

  it('Admins can reply to certain report from users and companies', async () => {
    return await mockRequest
      .patch('/admin/report/1')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(201);
      });
  });

  it('Admins can seed the database with fake data', async () => {
    return await mockRequest
      .post('/admin/seed/1')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });

  it('Admins can see all post from community', async () => {
    return await mockRequest
      .get('/admin/posts')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });
  it('Admins can see certain post from community', async () => {
    return await mockRequest
      .get('/admin/posts/5fa8652d11c97f06f164582c')
      .set('Cookie', [`token=${token}`])
      .then((result) => {
        expect(result.status).toBe(200);
      });
  });

  it('Admins can edit certain post from community', async () => {
    await mockRequest.post('/logout');
    await mockRequest
      .post('/signin')
      .send({ email: 'demop@gmail.com', password: '123456' })
      .then((result) => {
        token = result.body.token;
      });
    return mockRequest
      .post('/community/submit')
      .set('Cookie', [`token=${token}`])
      .send({
        title: 'test',
        body: 'test',
      })
      .then(async (results) => {
        await mockRequest.post('/logout');
        await mockRequest
          .post('/signin')
          .send({ email: 'demoadmin@gmail.com', password: '123456' })
          .then((result) => {
            token = result.body.token;
          });
        return await mockRequest
          .patch(`/admin/posts/${results.body._id}`)
          .set('Cookie', [`token=${token}`])
          .send({ pinned: 'true' })
          .then((result) => {
            expect(result.status).toBe(201);
          });
      });
  });

  it('Admins can delete certain post from community', async () => {
    await mockRequest.post('/logout');
    await mockRequest
      .post('/signin')
      .send({ email: 'demop@gmail.com', password: '123456' })
      .then((result) => {
        token = result.body.token;
      });
    return mockRequest
      .post('/community/submit')
      .set('Cookie', [`token=${token}`])
      .send({
        title: 'test',
        body: 'test',
      })
      .then(async (results) => {
        await mockRequest.post('/logout');
        await mockRequest
          .post('/signin')
          .send({ email: 'demoadmin@gmail.com', password: '123456' })
          .then((result) => {
            token = result.body.token;
          });
        return await mockRequest
          .delete(`/admin/posts/${results.body._id}`)
          .set('Cookie', [`token=${token}`])
          .send({ pinned: 'true' })
          .then((result) => {
            expect(result.status).toBe(201);
          });
      });
  });
});