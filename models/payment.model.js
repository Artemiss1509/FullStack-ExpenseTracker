import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/DB-connection.js";

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    orderAmount:{
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paymentSessionId:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    orderCurrency:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentStatus:{
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true
});

export default Payment;