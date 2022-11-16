const mongoose=require('mongoose')
const schema=mongoose.Schema

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{ 
        type:Number,
    },
    category:{ 
       
        type:String,
        ref:'category',
        required:true, 
    },
    colors:{
        type:[String]
    },
    stock:{
        type:Number,
        required:true,

    },
    brand:{
        type:String,
        required:true
    },
    discount:{ 
        type:Number,
        default:0,  
    },
    tags:{
        type:[String], 
        required:true,
    },
    product_image:{ 
        type:Array,
        required:true,
 
    }, 
    isdelete:{
        type:Boolean,
        default:false,
    },
     
}, 
{
    timestamps:true,
} 
);
const productModel=mongoose.model('products',productSchema)
module.exports=productModel
  