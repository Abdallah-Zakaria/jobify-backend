'use strict';

const client = require('../models/database');
const app = require('../server');
const notification = app.notifi;
const authHelpers = require('../models/auth-helpers');

notification.on('connection', (socket) => {
  console.log('connected to notification namespace', socket.id);

  socket.on('join', async (room) => {
    console.log(room);
    const tokenObject = await authHelpers.authenticateToken(room);
    console.log('joined', tokenObject.id);
    socket.join(tokenObject.id);
  });

  socket.on('checkNotif', async (payload) => {
    try {
      const tokenObject = await authHelpers.authenticateToken(payload.token);
      const value = [tokenObject.id];
      const SQL = 'SELECT * FROM notifications WHERE auth_id=$1;';
      const result = await client.query(SQL, value);
      result.rows.forEach(async (notifi) => {
        if (notifi.seen == 'false') {
          notification.to(tokenObject.id).emit('notification', notifi);
          const SQL = `UPDATE notifications SET seen=$1 WHERE id=$2;`;
          const values = ['true', notifi.id];
          await client.query(SQL, values);
        }
      });
    } catch (err) {
      console.log('something went wrong in checkNotif event');
    }
  });

  socket.on('notification', async (payload) => {
    if(notification.adapter.rooms[payload.id]){
      const SQL = 'SELECT * FROM notifications WHERE auth_id=$1;';
      const value = [payload.id];
      const result = await client.query(SQL, value);
      notification.to(payload.id).emit('notification', result.rows[result.rows.length - 1]);
      const SQL2 = `UPDATE notifications SET seen=$1 WHERE id=$2;`;
      const values = ['true', result.rows[result.rows.length-1].id];
      await client.query(SQL2, values);
    }
  });
});