'use strict';

//-----------------------------------// Export The Module \\-----------------------------------\\
module.exports = (req, res, next) => {
  res.status(404);
  res.statusMessage = 'Not Found';
  res.json({ error: 'Page not found' });
};

//-----------------------------------------------------------------------------------------\\
