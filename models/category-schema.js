const mongoose=require('mongoose')
const schema=mongoose.Schema

const categorySchema=new mongoose.Schema({
    category:{
        type:String, 
        required:true,
        trim:true,
    },
    imgCategory:{ 
        type:Array,
        required:true,
    }

})
const categoryModel=mongoose.model('Category',categorySchema)
module.exports=categoryModel 