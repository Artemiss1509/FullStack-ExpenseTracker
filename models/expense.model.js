import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/DB-connection.js";

const Expenses = sequelize.define('Expenses', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true
});

export default Expenses;