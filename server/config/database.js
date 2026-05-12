require('dotenv').config()

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  production: {
  use_env_variable: 'MYSQL_URL',
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  }
}
}
