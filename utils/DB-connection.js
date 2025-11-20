import { Sequelize } from 'sequelize';
import {DB_NAME, DB_USER, DB_PASSWORD, DB_ENDPOINT} from './env.js'

const sequelize = new Sequelize(DB_NAME, DB_USER,DB_PASSWORD,{
    host: 'localhost',
    dialect: 'mysql'
});

(async ()=>{ try {
    await sequelize.authenticate()
    console.log('Connection to the Database is successfull')

} catch (error) {
    console.log(error)
}})();


export default sequelize;