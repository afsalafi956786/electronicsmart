const mongoose = require('mongoose')
const schema = mongoose.Schema

const addressShema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    address: [{
        name: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: Number },
        phone: { type: String },
        email: { type: String },
    }]
},
    {
        timestamps: true,
    })
const addressModel = mongoose.model('address', addressShema)
module.exports = addressModel