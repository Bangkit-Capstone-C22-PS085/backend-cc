require('dotenv').config();
const jwt = require("jsonwebtoken");
const { Users } = require("../models")

const verifyToken = async (req, res, next) => {
    let authorization = req.headers["authorization"]
    if (!authorization) {
        return res.status(403).send({
            message: "No auth provided!"
        });
    }

    let token = authorization.split(' ')[1]

    if (!token) {
        return res.status(403).send({
            message: "No auth provided!"
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: err.message
            });
        }

        req.user_id = decoded.user_id;

        next();
    });
}

module.exports = {
    verifyToken
}