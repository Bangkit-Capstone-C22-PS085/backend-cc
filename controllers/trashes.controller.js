const { Trashes } = require("../models")
const fetch = require("node-fetch");
const FormData = require('form-data');

const getPrice = async (req, res) => {
    try {
        const b64 = req.body.b64;
        const form = new FormData();
        form.append('b64', b64);

        const getModelPredict = await fetch('https://api-services-model-ohbn7c3klq-et.a.run.app/api/predict/', {
            method: 'post',
            body: form,
        })

        const responsePredict = await getModelPredict.json();
        const data = await Trashes.findOne({
            where: { jenis: responsePredict.image.label }
        });

        if(!data){
            return res.status(404).json({
                message: "Data not found!"
            });
        }

        res.status(200).json({
            message: "Berhasil mengambil data",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

const getData = async (req, res) => {
    try {
        const data = await Trashes.findAll({ });

        res.status(200).json({
            message: "Berhasil mengambil data",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const getDetail =  async (req, res) => {
    try {
        const id = req.params.id;
    
        const data = await Trashes.findOne({
            where: { id },
        });

        if(!data){
            return res.status(404).json({
                message: "Data not found!"
            })
        }
    
        res.status(200).json({
            message: "Berhasil mengambil data",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const createData = async (req, res) => {
    try{
        const{ jenis, price } = req.body;
        const data = new Trashes({
            jenis, price
        })

        await data.save();

        res.status(200).json({
            message: "Berhasil membuat data",
            data: data
        });
    }catch (err){
        res.status(500).json({
            message: err.message
        })
    }
}

const updateData = async (req, res) => {
    try {
        const {jenis, price} = req.body;
        const id = req.params.id;
        
        const data = await Trashes.update({
            jenis, price
        },{ 
            where: { id: id } 
        });
    
        res.status(200).json({
            message: "Berhasil update data",
            data: data
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
}

const deleteData = async (req, res) => {
    try {
        const id = req.params.id;

        const checkData = await Trashes.findOne({where:{id}})
        if(!checkData){
            return res.status(404).json({
                message: "Data not found!"
            })
        }

        const data = await Trashes.destroy({
            where: { id: id }
        });

        res.status(200).json({
            message: "Berhasil menghapus data",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    getPrice,
    getData,
    getDetail,
    createData,
    updateData, 
    deleteData
}