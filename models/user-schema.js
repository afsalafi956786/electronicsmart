const mongoose=require('mongoose')
const schema=mongoose.Schema

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    }, 
    email:{
        type:String,  
        required:true,
        unique:true,  
        trim:true,
    },
    password:{  
        type:String,
        required:true, 
        trim:true,
        minlength:[6],
    },
    phone:{
        type:Number,
    },
    isBanned:{
        type:Boolean,
        default:false,
    }, 
 
     
 
},   
{ 
    timestamps:true,
}
)

const usermodel = mongoose.model('users',userSchema)
module.exports=usermodel