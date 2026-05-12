console.log('MYSQL_URL:', process.env.MYSQL_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)


const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const { sequelize } = require('./models');

sequelize.authenticate()
.then(() => {
    console.log("MySQL connected successfully")
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})
.catch((err) => {
    console.log('Unable to connect to database', err);
    process.exit(1)
})
