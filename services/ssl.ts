import * as fs from 'fs';
import * as path from 'path';

const dir = '/etc/letsencrypt/live/api.danfy.online/';

let ssl = {};

if (fs.existsSync(dir)) {
  ssl = {
    cert: fs.readFileSync(path.join(dir, 'fullchain.pem')),
    key: fs.readFileSync(path.join(dir, 'privkey.pem')),
  };
}

export const SSL = ssl;

export default {
  SSL,
};
