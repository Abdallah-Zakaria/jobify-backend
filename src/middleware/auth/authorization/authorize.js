'use strict';
const authHelpers = require('../../../models/auth-helpers');

module.exports = async (role) => {
  async (req, res, next) => {
    try {
      if (!req.cookies.token) {
        next('Access Denied');
      }
      const tokenObject = await authHelpers.authenticateToken(req.cookies.token);

      if (tokenObject.account_type == role[0] || tokenObject.account_type == role[1]) {
        next();
      } else {
        next('Access Denied, You are not Authorized');
      }
    } catch (err) {
      next(err);
    }
  };
};
