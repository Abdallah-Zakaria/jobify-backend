'use strict';
const express = require('express');
const router = express.Router();
const helper = require('../models/helper');
const ip = require('../middleware/location');
const admin = require('../models/admin');

router.get('/', (req, res) => {});

router.post('/block/:id', (req, res) => {
  //
});

router.get('/posts', (req, res) => {});

router.delete('/posts/:id', (req, res) => {});

router.delete('/comments/:id', (req, res) => {});

// router.post('/approve/:id', (req, res) => {});

router.get('/report', async (req, res) => {
  const data = await admin.reports();
  res.status(200).json(data);
});

router.get('/report/:id', async (req, res) => {
  const data = await admin.report(req.params.id);
  res.status(200).json(data);
});

router.patch('/report/:id', async (req, res) => {
  await admin.answerReport(req.params.id, req.body.response);
  res.status(201).json({});
});

module.exports = router;
