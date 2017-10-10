var bcrypt = require('bcrypt');
const keys = require('../config/keys');

var loginCheck = (req, resp, next) => {

  bcrypt.compare(req.body.password, keys.Admin_Login_Hash, (err, res) => {
    if (res) {
      next();
    } else {
      resp.redirect('/');
    }
  });

}

module.exports = { loginCheck };
