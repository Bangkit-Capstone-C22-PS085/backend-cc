const sequelize = require("sequelize");
const db = require("../config/db");
const TransactionDetails = require("./transaction_details");
const Users = require("./users")
const TransactionEnums = require("../config/transactionEnums")

const Transactions = db.define(
    "transactions",
    {
        user_id: { type: sequelize.INTEGER },
        user_id_operator: { type: sequelize.INTEGER },
        total: { type: sequelize.STRING },
        status: { type: sequelize.ENUM(TransactionEnums.PENDING, TransactionEnums.WAITING, TransactionEnums.COMPLETE) },
    },
    {
        freezeTableName: true
    }
);

Transactions.hasMany(TransactionDetails, {
    as: "details",
    foreignKey: "transaction_id"
})

Transactions.belongsTo(Users, {
    as: "member",
    foreignKey: "user_id"
})

Transactions.belongsTo(Users, {
    as: "operator",
    foreignKey: "user_id_operator"
})

module.exports = Transactions