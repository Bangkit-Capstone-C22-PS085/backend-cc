require('dotenv').config();
const { Users, Members } = require("../models")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userEnums = require("../config/userEnums")

const login = async (req, res) => {
    try {
        let { username, password } = req.body
        const user = await Users.findOne({
            where:{
                username
            },
            include: ["member"]
        })

        if(!user){
            return res.status(401).json({
                message: "Pengguna belum terdaftar!"
            });
        }

        const passwordIdValid = bcrypt.compareSync(password, user.password)
        if(!passwordIdValid){
            return res.status(401).json({
                message: "Password Salah!"
            });
        }

        const payload = {
            user_id: user.id,
            username: user.username,
            email: user.email,
            type: user.type 
        }

        const accessToken = `Bearer ${generateAccessToken(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10d'})}`
        const refreshToken = generateAccessToken(payload, process.env.REFRESH_TOKEN_SECRET)

        return res.status(200).json({
            message: "Berhasil login!",
            user: user,
            token: {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

const register = async (req, res) => {
    try {
        let { username, email, name, password, password_confirm } = req.body

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);
        let type = userEnums.MEMBER

        const user = new Users({
            username, email, password: hash, type
        })
        
        let userData = await user.save();
        let user_id = userData.id 

        const member = new Members({
            user_id, name, email, points: 0, balance: 0
        })

        await member.save();

        res.status(200).json({
            message: "Berhasil daftar!",
            user,
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

const me = async (req, res) => {
    try {
        let user_id = req.user_id

        let data = await Users.findOne({where: {id: user_id}, include: ["member"]})

        res.status(200).json({
            message: "Berhasil mengambil data!",
            data,
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

const generateAccessToken = (payload, secretKey, expires) => jwt.sign(payload, secretKey, expires);

module.exports = {
    login,
    register,
    me
}