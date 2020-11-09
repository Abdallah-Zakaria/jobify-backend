'use strict';

const pg = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL || 'postgres://cfhvehroybtxno:4e80bb1febce3bcbff16270ace95a5eb2651ac6265b7f13b6670fd59d3a7cd2a@ec2-54-75-150-32.eu-west-1.compute.amazonaws.com:5432/de21mpndrtla6d';

module.exports = new pg.Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});
