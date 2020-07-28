import { Sequelize } from 'sequelize';

require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    schema: 'danfy',
    ssl: {
      require: false,
      rejectUnauthorized: false,
    },
  },
});

export default sequelize;
