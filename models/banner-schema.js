const mongoose=require('mongoose')
const schema=mongoose.Schema

const bannerSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,

    },
    prodcutname:{
        type:String,
    },
    url:{
        type:String
    },
    price:{
        type:Number
    },
    discount:{
        type:Number
    },
    imgBanner:{ 
        type:Array,
        required:true, 
    } 

},{
    timestamps:true,
})
const bannerModel=mongoose.model('banner',bannerSchema)
module.exports=bannerModel