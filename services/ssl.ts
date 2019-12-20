import fs from 'fs';
import path from 'path';

const dir = '/etc/letsencrypt/live/api.danfy.online/';

let SSL = {};

if (fs.existsSync(dir)) {
  SSL = {
    cert: fs.readFileSync(path.join(dir, 'fullchain.pem')),
    key: fs.readFileSync(path.join(dir, 'privkey.pem')),
  };
}

export default {
  SSL,
};
