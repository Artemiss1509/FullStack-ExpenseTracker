import { Sequelize, DataTypes, UUID, BOOLEAN } from "sequelize";
import sequelize from "../utils/DB-connection.js";

const PasswordResetReq = sequelize.define('PasswordRestReq',{
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue: true
    }
},{
    timestamps:true
});

export default PasswordResetReq;