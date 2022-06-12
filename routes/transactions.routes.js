const express = require("express")
const router = express.Router()
const transactionsController = require("../controllers/transactions.controller")
const verifyToken = require("../middleware/authJwt")

router.get("/", transactionsController.getData);
router.get("/:id", transactionsController.getDataDetail);
router.post("/", transactionsController.createData);
router.put("/complete/:id", [
    verifyToken.verifyToken
], transactionsController.completeTransaction)

module.exports = router