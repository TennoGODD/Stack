require('dotenv').config();

module.exports = {
  baseURL: process.env.PLAYWRIGHT_BASE_URL,
  login: process.env.PLAYWRIGHT_LOGIN,
  password: process.env.PLAYWRIGHT_PASSWORD,
};
