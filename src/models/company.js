'use strict';

//------------------------------// Third Party Resources \\----------------------------\\
require('dotenv').config();

//---------------------------------// Import Resources \\-------------------------------\\
const client = require('../models/database');
const notifi = require('../models/notifications');
const helper = require('./helper');

//--------------------------------// Esoteric Resources \\-------------------------------\\
const test = process.env.TESTS || 'true';

//----------------------------------// Company Module \\--------------------------------\\
class Company {
  constructor() {}

  async dashboard(company) {
    const offers = await this.companyOffers(company);
    const apps = await this.companyApps(company);
    let notifications;
    if (test == 'false') {
      notifications = await notifi.getNotificaions(company.id);
    }

    const jobs = await client.query(`SELECT id FROM jobs WHERE company_id=${company.id}`);

    const statistics = { number_of_applications: apps.length, number_of_offers: offers.length, number_of_submited_jobs: jobs.rows.length };
    return { statistics, offers, apps, notifications };
  }

  async jobs(company, jobId) {
    if (jobId) {
      const id = await helper.getID(company.id, 'company');
      let SQL = `SELECT * FROM jobs WHERE company_id=$1 AND id=$2;`;
      let value = [id, jobId];
      const data = await client.query(SQL, value);
      return data.rows[0];
    } else {
      const id = await helper.getID(company.id, 'company');
      let SQL = `SELECT * FROM jobs WHERE company_id=$1;`;
      let value = [id];
      const data = await client.query(SQL, value);
      return data.rows;
    }
  }

  async submitJob(company, payload) {
    const id = await helper.getID(company.id, 'company');
    let { title, location, type, description } = payload;
    let SQL = `INSERT INTO jobs (company_id,title,location,type,description) VALUES ($1,$2,$3,$4,$5);`;
    let value = [id, title, location, type, description];
    await client.query(SQL, value);
  }

  async editJob(company, jobID, payload) {
    const id = await helper.getID(company.id, 'company');
    const SQL1 = `SELECT company_id FROM jobs WHERE id=$1`;
    const value1 = [jobID];
    const check = await client.query(SQL1, value1);
    if (check.rows[0].company_id == id) {
      let { title, location, type, description } = payload;
      let SQL = `UPDATE jobs SET title=$1,location=$2,type=$3,description=$4 WHERE id=$5;`;
      let value = [title, location, type, description, jobID];
      await client.query(SQL, value);
    } else {
      throw new Error(`Can't edit job`);
    }
  }

  async deleteJob(company, jobID) {
    const id = await helper.getID(company.id, 'company');
    let value = [jobID];
    const SQL0 = `SELECT company_id FROM jobs WHERE id=$1`;
    const check = await client.query(SQL0, value);
    if (check.rows[0].company_id == id) {
      let SQL1 = `DELETE FROM applications WHERE job_id=$1;`;
      let SQL2 = `DELETE FROM jobs WHERE id=$1;`;
      await client.query(SQL1, value);
      await client.query(SQL2, value);
    } else {
      throw new Error(`Can't delete job`);
    }
  }

  async companyApps(company) {
    const id = await helper.getID(company.id, 'company');
    let SQL = `SELECT *,applications.id FROM applications JOIN person ON applications.person_id=person.id WHERE company_id=$1;`;
    let value = [id];
    const data = await client.query(SQL, value);
    return data.rows;
  }

  async companySingleApp(id) {
    let SQL = `SELECT status FROM applications WHERE id=$1;`;
    let value = [id];
    const data = await client.query(SQL, value);
    return data.rows[0];
  }

  async answerApp(company, appID, payload) {
    const id = await helper.getID(company.id, 'company');
    let values = [payload, appID];
    const value = [appID];
    const SQL0 = `SELECT company_id FROM applications WHERE id=$1;`;
    const check = await client.query(SQL0, value);
    if (check.rows[0].company_id == id) {
      let SQL = `UPDATE applications SET status=$1 WHERE id=$2;`;
      await client.query(SQL, values);
    } else {
      throw new Error(`Can't answer application`);
    }
  }

  async companyOffers(company) {
    const id = await helper.getID(company.id, 'company');
    let SQL = `SELECT *,job_offers.id FROM job_offers JOIN person ON job_offers.person_id=person.id WHERE company_id=$1`;
    let value = [id];
    const data = await client.query(SQL, value);
    return data.rows;
  }

  async sendOffer(company, user, payload) {
    const person_auth_id = await helper.getAuthID(user, 'person');
    const id = await helper.getID(company.id, 'company');
    let person_id = user;
    let company_id = id;
    let { title, location, type, description } = payload;
    let SQL = `INSERT INTO job_offers (person_id,company_id,title,location,type,description) VALUES ($1,$2,$3,$4,$5,$6);`;
    let value = [person_id, company_id, title, location, type, description];
    await client.query(SQL, value);
    let SQL2 = `SELECT company_name FROM company WHERE id=$1;`;
    let value2 = [id];
    let results = await client.query(SQL2,value2);
    if (test == 'false') {
      const data = { id: person_auth_id, title: 'Offer', description: `${results.rows[0].company_name} sent you an offer for position ${title}` };
      await notifi.addNotification(data);
    }
  }

  async deleteOffer(company, offerID) {
    const id = await helper.getID(company.id, 'company');
    const value0 = [offerID];
    const SQL0 = `SELECT company_id FROM job_offers WHERE id=$1;`;
    const check = await client.query(SQL0, value0);
    if (check.rows[0].company_id == id) {
      let SQL = `DELETE FROM job_offers WHERE id=$1`;
      let value = [offerID];
      await client.query(SQL, value);
    } else {
      throw new Error(`Can't answer application`);
    }
  }

  async editProfile(company, payload) {
    const id = await helper.getID(company.id, 'company');
    let { company_name, phone, logo, country, company_url } = payload;
    let SQL = `UPDATE company SET company_name=$1,phone=$2,logo=$3,country=$4,company_url=$5 WHERE id=$6;`;
    let value = [company_name, phone, logo, country, company_url, id];
    await client.query(SQL, value);
  }

  async searchEmployee(payload) {
    let { job_title, country } = payload;
    let SQL = `SELECT * FROM person WHERE job_title ~* $1 AND country ~* $2;`;
    let value = [job_title, country];
    const result = await client.query(SQL, value);
    return result.rows;
  }
}

//-----------------------------------// Export Module \\-----------------------------------\\
module.exports = new Company();

//-----------------------------------------------------------------------------------------\\
