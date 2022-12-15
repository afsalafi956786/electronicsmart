const mongoose = require('mongoose')
const schema = mongoose.Schema

const couponSchema = new mongoose.Schema({
  
    code:String,
    type:String,
    discount:{type:Number,trim:true},
    limit:Number,
    status:String,
    startDate:Date,
    endDate:Date,
},
{
  timestamps:true,
}
);

const couponModel = mongoose.model("coupon",couponSchema )
module.exports = couponModel