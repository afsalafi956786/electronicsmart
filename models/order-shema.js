const mongoose=require('mongoose')
const schema=mongoose.Schema


const orderSchema = new mongoose.Schema({
    address:{
        name: String,
        address:String,
        city:String,
        state:String,
        pincode:Number,
        phone:String,
    },
    user:{type:mongoose.Types.ObjectId,
          ref:'users'
        },
    payment:String,
    products:Array,
    total:Number,
    status:String,
},
{
  timestamps:true,
}
);


const orderModel = mongoose.model("order",orderSchema )
module.exports = orderModel