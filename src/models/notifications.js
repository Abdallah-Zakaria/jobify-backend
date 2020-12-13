'use strict';
/* istanbul ignore file */

//------------------------------// Third Party Resources \\----------------------------\\
const io = require('socket.io-client');

//---------------------------------// Import Resources \\-------------------------------\\
const client = require('../models/database');

//--------------------------------// Notificaion Module \\------------------------------\\
class Notificaion {
  constructor() {}

  async getNotificaions(id) {
    const SQL = 'SELECT * FROM notifications WHERE auth_id=$1;';
    const value = [id];
    const result = await client.query(SQL, value);
    return result.rows;
  }

  async addNotification(payload) {
    const { title, description, id } = payload;
    const SQL = 'INSERT INTO notifications (title,description,seen,auth_id) VALUES ($1,$2,$3,$4);';
    const values = [title, description, 'false', id];
    await client.query(SQL, values);
    const notifi = io.connect('https://jobify-app-v2.herokuapp.com/notification');
    notifi.emit('notification', { id });
  }
}

//-----------------------------------// Export Module \\-----------------------------------\\
module.exports = new Notificaion();

//-----------------------------------------------------------------------------------------\\
