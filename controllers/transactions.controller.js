const { Transactions, TransactionDetails, Carts, Trashes, Users, Members, Operators } = require("../models")
const transactionEnums = require("../config/transactionEnums")

const getData = async (req, res) => {
    try {
        const status = req.params.status 

        let whereCondition = {
            user_id: req.user_id
        }

        if(status){
            whereCondition.status = status
        }

        const data = await Transactions.findAll({ 
            include: [{
                model: TransactionDetails,
                as: "details",
                include: [{
                    model: Trashes,
                    as: "trash"
                }]
            }, 
            {
                model: Users,
                as: "member",
                include: [{
                    model: Members,
                    as: "member"
                }]
            }, 
            {
                model: Users,
                as: "operator",
                include: [{
                    model: Operators,
                    as: "operator"
                }]
            }
        ],
            where: whereCondition
        });

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

const getDataDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user_id

        const data = await Transactions.findOne({
            include: [{
                model: TransactionDetails,
                as: "details",
                include: [{
                    model: Trashes,
                    as: "trash"
                }]
            }, {
                model: Users,
                as: "member",
                include: [{
                    model: Members,
                    as: "member"
                }]
            }, 
            {
                model: Users,
                as: "operator",
                include: [{
                    model: Operators,
                    as: "operator"
                }]
            }
        ],
            where: { id, user_id },
        });

        if(!data){
            res.status(404).json({
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
        let user_id = req.user_id;
        const carts = await Carts.findAll({where: {user_id}, include: ["trash"]})
        let total = await getCartsSubtotal(carts)
        let status = transactionEnums.PENDING

        if(carts.length == 0){
            return res.status(400).json({
                message: "Keranjang anda masih kosong!"
            })
        }

        //store transaction table
        const data = await Transactions.create({
            user_id, total, status
        })

        //store transaction detail table
        carts.forEach(cart => {
            TransactionDetails.create({
                transaction_id: data.id,
                trashes_id: cart.trashes_id,
                quantity: cart.quantity,
                subtotal: cart.subtotal
            })
        })

        //Clear Cart
        await Carts.destroy({
            where: { user_id }
        });

        res.status(200).json({
            message: "Berhasil melakukan order",
            data
        });
    }catch (err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getCartsSubtotal = async (carts) => {
    let total = 0;
    await carts.forEach(cart => {
        total += cart.trash.price
    });

    return total
}

const buyTransaction = async (req, res) => {
    try{
        let user_id = req.user_id;
        let id = req.params.id;

        //store transaction table
        const dataTransaction = await Transactions.findOne({ where: { id, status: transactionEnums.PENDING } })

        if(!dataTransaction){
            return res.status(404).json({
                message: "Data not found!!"
            })
        }

        const updateData = await Transactions.update({
            user_id_operator: user_id,
            status: transactionEnums.WAITING
        },{ 
            where: { id } 
        });

        res.status(200).json({
            message: "Berhasil melakukan pembelian sampah",
            data: updateData
        });
    }catch (err){
        res.status(500).json({
            message: err.message
        })
    }
}

const completeTransaction = async (req, res) => {
    try{
        let user_id = req.user_id;
        let id = req.params.id;

        //store transaction table
        const dataTransaction = await Transactions.findOne({ where: { id, status: transactionEnums.WAITING, user_id: user_id } })

        if(!dataTransaction){
            return res.status(404).json({
                message: "Data not found!!"
            })
        }

        const updateData = await Transactions.update({
            status: transactionEnums.COMPLETE
        },{ 
            where: { id } 
        });


        let balance = dataTransaction.total

        const updateUserMember = await Members.update({
            balance
        }, {
            where: {
                id: user_id
            }
        })

        res.status(200).json({
            message: "Berhasil menyelesaikan pembelian sampah",
            data: updateData
        });
    }catch (err){
        res.status(500).json({
            message: err.message
        })
    }
}

const getDataOperator = async (req, res) => {
    try {
        const status = req.params.status 

        let whereCondition = {
            user_id_operator: req.user_id
        }

        if(status){
            whereCondition.status = status
        }

        const data = await Transactions.findAll({ 
            include: [{
                model: TransactionDetails,
                as: "details",
                include: [{
                    model: Trashes,
                    as: "trash"
                }]
            }, 
            {
                model: Users,
                as: "member",
                include: [{
                    model: Members,
                    as: "member"
                }]
            }, 
            {
                model: Users,
                as: "operator",
                include: [{
                    model: Operators,
                    as: "operator"
                }]
            }
        ],
            where: whereCondition
        });

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

const getDataDiscoverTrasnaction = async (req, res) => {
    try {
        let whereCondition = {

            status: "PENDING"
        }

        const data = await Transactions.findAll({ 
            include: [{
                model: TransactionDetails,
                as: "details",
                include: [{
                    model: Trashes,
                    as: "trash"
                }]
            }, 
            {
                model: Users,
                as: "member",
                include: [{
                    model: Members,
                    as: "member"
                }]
            }, 
            {
                model: Users,
                as: "operator",
                include: [{
                    model: Operators,
                    as: "operator"
                }]
            }
        ],
            where: whereCondition
        });

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

const getDataOperatorDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user_id

        const data = await Transactions.findOne({
            include: [{
                model: TransactionDetails,
                as: "details",
                include: [{
                    model: Trashes,
                    as: "trash"
                }]
            }, {
                model: Users,
                as: "member",
                include: [{
                    model: Members,
                    as: "member"
                }]
            }, 
            {
                model: Users,
                as: "operator",
                include: [{
                    model: Operators,
                    as: "operator"
                }]
            }
        ],
            where: { id, user_id_operator: user_id },
        });

        if(!data){
            res.status(404).json({
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

module.exports = {
    getData,
    getDataDetail,
    createData,
    buyTransaction,
    completeTransaction,
    getDataOperator,
    getDataOperatorDetail,
    getDataDiscoverTrasnaction
}