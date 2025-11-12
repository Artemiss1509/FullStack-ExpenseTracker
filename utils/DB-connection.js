const {Sequelize} = require('sequelize')

const sequelize = new Sequelize('NewDB','root','Artemiss1509',{
    host: 'localhost',
    dialect: 'mysql'
});

(async ()=>{ try {
    await sequelize.authenticate()
    console.log('Connection to the Database is successfull')

} catch (error) {
    console.log(error)
}})();


module.exports=sequelize;