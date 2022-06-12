const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const verifiySignUp = require("../middleware/verifySignUp")
const authJwt = require("../middleware/authJwt")

router.get("/me", [authJwt.verifyToken], authController.me);
router.post("/login", authController.login);
router.post("/register", [verifiySignUp.checkDuplicateUsernameorEmail], authController.register);
router.put("/update-address", [authJwt.verifyToken], authController.updateAddress)
module.exports = router