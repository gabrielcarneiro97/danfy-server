const fs = require('fs');
const path = require('path');

const dir = '/etc/letsencrypt/live/api.danfy.online/';

const SSL = {
  cert: fs.readFileSync(path.join(dir, 'fullchain.pem')),
  key: fs.readFileSync(path.join(dir,'privkey.pem')),
};

module.exports = {
  SSL,
};
