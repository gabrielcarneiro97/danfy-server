const xml = require('./xml.service');
const firebase = require('./firebase.service');

module.exports = {
  ...xml,
  ...firebase,
};
