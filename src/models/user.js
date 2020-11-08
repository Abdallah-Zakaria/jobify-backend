'use strict';

const client = require('../models/database');
const superagent = require('superagent');
const notifi = require('../models/notifications');
const helper = require('./helper');

class User {
  constructor() {}

  async dashboard(user) {
    const id = await helper.getID(user.id, 'person');
    let SQL = `SELECT job_title,country FROM person WHERE id=$1;`;
    let value = [id];
    const data = await client.query(SQL, value);
    const title = data.rows[0].job_title;
    const location = data.rows[0].country;
    const job = await this.searchJob({ title, location });
    const suggJob = { resultDB: job.resultDB.splice(5), resultAPI: job.resultAPI.splice(5) };
    const apps = await this.userApps(user);
    const offer = await this.userOffers(user);
    return { suggJob, numOfApp: Number(apps.DB.length) + Number(apps.API.length), numOfOffer: offer.length };
  }

  async applyDB(user, payload) {
    let { jobID, companyID } = payload;
    let personID = await helper.getID(user.id, 'person');
    let SQL = `INSERT INTO applications (person_id,job_id,company_id) VALUES ($1,$2,$3);`;
    let value = [personID, jobID, companyID];
    await client.query(SQL, value);
    const data = { id: user.id, title: 'Application', description: `recevied application to ${jobID} job` };
    await notifi.addNotification(data);
  }

  async applyAPI(user, payload) {
    console.log(user, payload);
    let { title, location, type, company_name, status, logo, email } = payload;
    let personID = await helper.getID(user.id, 'person');
    let SQL = `INSERT INTO applications_api (title, location, type, company_name, status, logo, person_id) VALUES ($1,$2,$3,$4,$5,$6,$7);`;
    let value = [title, location, type, company_name, 'Submitted', logo, personID];
    await client.query(SQL, value);
    let userData = await helper.getProfile(personID, 'person');
    const record = { company: payload, person: userData };
    helper.sendEmail(email, record);
  }

  async userApps(user) {
    const id = await helper.getID(user.id, 'person');
    let SQL = `SELECT * FROM applications JOIN jobs ON applications.job_id=jobs.id JOIN company ON applications.company_id=company.id WHERE person_id= $1;`;
    let value = [id];
    let SQL2 = `SELECT * FROM applications_api WHERE person_id= $1;`;
    let value2 = [id];
    const dataDB = await client.query(SQL, value);
    const dataApi = await client.query(SQL2, value2);

    return { DB: dataDB.rows, API: dataApi.rows };
  }

  async deleteApp(appID) {
    let SQL = `DELETE FROM applications WHERE id=$1;`;
    let value = [appID];
    await client.query(SQL, value);
  }

  async userOffers(user) {
    const id = await helper.getID(user.id, 'person');
    let SQL = `SELECT * FROM job_offers JOIN company ON job_offers.company_id=company.id WHERE person_id=$1;`;
    let value = [id];
    const data = await client.query(SQL, value);
    return data.rows;
  }

  async answerOffer(offerID, payload) {
    let SQL = `UPDATE job_offers SET status=$1 WHERE id=$2;`;
    let value = [payload, offerID];
    await client.query(SQL, value);
  }

  async editProfile(user, payload) {
    const id = await helper.getID(user.id, 'person');
    let { first_name, last_name, phone, job_title, country, age, avatar, experince, cv } = payload;
    let SQL = `UPDATE person SET first_name=$1,last_name=$2,phone=$3,job_title=$4,country=$5,age=$6,avatar=$7,experince=$8,cv=$9 WHERE id=$10;`;
    let value = [first_name, last_name, phone, job_title, country, age, avatar, experince, cv, id];
    await client.query(SQL, value);
  }

  async searchJob(payload) {
    let { title, location } = payload;
    let SQL = `SELECT * FROM jobs JOIN company ON jobs.company_id=company.id WHERE title=$1 AND location=$2;`;
    let value = [title, location];
    let URL = `https://jobs.github.com/positions.json?description=${title}&location=${location}&?markdown=true`;
    const result1 = await client.query(SQL, value);
    const resultDB = result1.rows;
    const result2 = await superagent.get(URL);
    const resultAPI = result2.body.map((item) => {
      return new JOB(item);
    });
    return { resultDB, resultAPI };
  }

  async searchCompany(payload) {
    let { company_name, country } = payload;
    let SQL = `SELECT * FROM company WHERE company_name=$1 AND country=$2;`;
    let value = [company_name, country];
    const result = await client.query(SQL, value);
    return result.rows[0];
  }
}

const JOB = function (data) {
  this.title = data.title ? data.title : 'There is no job title';
  this.location = data.location ? data.location : 'Amman';
  this.type = data.type ? data.type : 'Full-time';
  this.company_name = data.company ? data.company : 'Company Name';
  // this.description = data.description ? data.description : 'There is no description';
  this.logo = data.company_logo || 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png';
  this.company_url = data.company_url;
  this.email = data.email ? data.email : 'mohammad.esseili@gmail.com';
  this.api = true;
};

module.exports = new User();
