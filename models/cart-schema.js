const mongoose=require('mongoose');
const schema=mongoose.Schema
 

const cartSchema=new mongoose.Schema({
    
    user:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    }, 
    products:[{
        item:{type:mongoose.Types.ObjectId,ref:'products',
    required:true,},
    quantity:{type:Number,default:1}
    }],
    subtotal:{
        type:String,
    }

},
{
    timestamps:true
}
);

const cartModel=mongoose.model('cart',cartSchema)
module.exports=cartModel