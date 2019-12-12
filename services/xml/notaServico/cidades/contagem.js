const fs = require('fs');
const { xmlToObj } = require('../../xml');

const testeObj = xmlToObj(fs.readFileSync(`${__dirname}/teste.xml`));
