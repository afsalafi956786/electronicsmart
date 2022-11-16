const mongoose=require('mongoose')
const schema=mongoose.Schema

const adminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:'true',
        unique:true,
        trim:true, 
    }, 
    password:{  
        type:String,
        trim:true, 
        required:true, 
        minlength:[6],
    } 
})
 
const adminModel=mongoose.model('admin',adminSchema)
module.exports=adminModel 