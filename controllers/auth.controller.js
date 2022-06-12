require('dotenv').config();
const { Users, Members, Operators } = require("../models")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userEnums = require("../config/userEnums");
const { Op } = require('sequelize');

const login = async (req, res) => {
    try {
        let { username, password } = req.body
        
        const user = await Users.findOne({
            where:{
                [Op.or]: [
                    {username},
                    {email: username}
                ]
            },
            include: ["member", "operator"]
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
        let { username, email, name, password, password_confirm, type } = req.body

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);

        const user = new Users({
            username, email, password: hash, type
        })
        
        let userData = await user.save();
        let user_id = userData.id 

        if(type == userEnums.MEMBER){
            await Members.create({
                user_id, name, points: 0, balance: 0
            })
        }else if(type == userEnums.OPERATOR){
            await Operators.create({
                user_id, name, points: 0, balance: 0
            })
        }

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

        let data = await Users.findOne({where: {id: user_id}, include: ["member", "operator"]})

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

const updateAddress = async (req, res) => {
    try {
        let { long, lat, address } = req.body
        let user_id = req.user_id
        
        const getData = await Users.findOne({where:{id:user_id}})

        if(!getData){
            return res.status(404).json({
                message: "Data not found!"
            })
        }

        let data
        if(getData.type == "OPERATOR"){
            data = await Operators.update({
                long, lat, address
            },{ 
                where: { id: getData.id } 
            });
        }else{
            data = await Members.update({
                long, lat, address
            },{ 
                where: { id: getData.id } 
            });
        }


        res.status(200).json({
            message: "Berhasil update profile!",
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
    me,
    updateAddress
}